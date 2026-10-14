---
title: VPC와 Bastion Host 정리
date: 2026-10-13
tags: [AWS, VPC, Bastion, 네트워크]
summary: VPC의 구성 요소(서브넷, 라우팅, 게이트웨이, 보안 그룹)와 private 서버에 접속하기 위한 Bastion Host의 개념을 정리했습니다.
---

클라우드에서 서버를 띄우면 "이 서버는 외부에서 접근돼도 되는가?"를 먼저 정해야 합니다. 그 경계를 만드는 것이 **VPC**이고, 외부에서 막아 둔 서버에 관리자가 들어가기 위한 통로가 **Bastion Host**입니다. 이 글은 AWS를 기준으로 설명하지만, 다른 클라우드도 개념은 거의 같습니다.

## VPC란

VPC(Virtual Private Cloud)는 클라우드 안에 만드는 **나만의 격리된 네트워크**입니다. 회사 사무실에 공유기를 하나 두고 내부망을 구성하는 것과 비슷합니다. VPC를 만들 때는 이 네트워크가 쓸 IP 대역을 CIDR로 정합니다.

```text
VPC: 10.0.0.0/16  → 10.0.0.0 ~ 10.0.255.255 (약 65,000개 IP)
```

같은 VPC 안의 리소스끼리는 사설 IP로 통신하고, 다른 VPC나 인터넷과는 기본적으로 단절되어 있습니다. 외부와 연결하려면 아래 구성 요소를 직접 붙여야 합니다.

## VPC의 구성 요소

### 서브넷 (Subnet)

VPC의 IP 대역을 더 작게 나눈 구역입니다. 서브넷은 하나의 가용 영역(AZ)에 속합니다.

| 서브넷 | 예시 CIDR | 용도 |
| --- | --- | --- |
| Public Subnet | 10.0.1.0/24 | 로드밸런서, Bastion Host, NAT Gateway |
| Private Subnet | 10.0.11.0/24 | 애플리케이션 서버 |
| Private Subnet (DB) | 10.0.21.0/24 | 데이터베이스 |

public과 private를 가르는 것은 서브넷의 이름이 아니라 **라우팅 테이블**입니다. 인터넷 게이트웨이로 가는 경로가 있으면 public, 없으면 private입니다.

### 인터넷 게이트웨이 (Internet Gateway, IGW)

VPC와 인터넷을 연결하는 출입문입니다. VPC에 하나를 붙이고, public 서브넷의 라우팅 테이블에 `0.0.0.0/0 → IGW` 경로를 추가합니다. 이 서브넷의 인스턴스가 public IP를 가지고 있으면 인터넷과 양방향으로 통신할 수 있습니다.

### NAT Gateway

private 서브넷의 서버도 패키지 설치나 외부 API 호출처럼 **밖으로 나가는** 통신은 필요합니다. NAT Gateway는 public 서브넷에 두고, private 서브넷의 라우팅 테이블에 `0.0.0.0/0 → NAT` 경로를 넣습니다.

- 나가는 요청은 NAT의 public IP로 바뀌어 인터넷으로 나갑니다.
- 바깥에서 먼저 들어오는 연결은 받지 않습니다.

### 라우팅 테이블 (Route Table)

서브넷에서 나가는 트래픽이 어디로 갈지 정하는 규칙입니다.

```text
# Public 서브넷의 라우팅 테이블
10.0.0.0/16  → local      # VPC 내부 통신
0.0.0.0/0    → igw-xxxx   # 그 외는 인터넷 게이트웨이로

# Private 서브넷의 라우팅 테이블
10.0.0.0/16  → local
0.0.0.0/0    → nat-xxxx   # 그 외는 NAT를 거쳐 밖으로만
```

### 보안 그룹과 네트워크 ACL

둘 다 방화벽이지만 붙는 위치와 동작이 다릅니다.

| 구분 | 보안 그룹 (Security Group) | 네트워크 ACL |
| --- | --- | --- |
| 적용 대상 | 인스턴스(ENI) 단위 | 서브넷 단위 |
| 규칙 | 허용만 가능 | 허용과 거부 모두 가능 |
| 상태 | Stateful: 응답 트래픽은 자동 허용 | Stateless: 들어오고 나가는 규칙을 각각 설정 |
| 평가 | 모든 규칙을 함께 평가 | 번호 순서대로 평가 |

보통은 보안 그룹으로 대부분을 제어하고, 네트워크 ACL은 기본값으로 두거나 특정 IP 대역 차단처럼 서브넷 전체에 걸 규칙에만 씁니다. 보안 그룹은 IP 대신 **다른 보안 그룹을 출발지로** 지정할 수 있다는 점이 특히 유용합니다. Bastion 구성에서 이 기능을 씁니다.

## 전형적인 구성

```text
                       Internet
                          │
                  ┌───────┴───────┐
                  │  Internet GW  │
                  └───────┬───────┘
┌─ VPC 10.0.0.0/16 ───────┼────────────────────────┐
│                         │                        │
│  ┌─ Public Subnet ──────┴──────────────────────┐ │
│  │  [ALB]      [Bastion]       [NAT Gateway]   │ │
│  └────┬───────────┬───────────────────▲────────┘ │
│       │ HTTP      │ SSH               │ outbound │
│  ┌─ Private Subnet ───────────────────┴────────┐ │
│  │  [App Server]      [App Server]             │ │
│  └────────────────────┬────────────────────────┘ │
│                       │ 5432                     │
│  ┌─ Private Subnet (DB) ───────────────────────┐ │
│  │  [RDS]                                      │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- 사용자 요청은 public 서브넷의 로드밸런서(ALB)로 들어와 private 서브넷의 앱 서버로 전달됩니다.
- 앱 서버와 DB는 public IP가 없어서 인터넷에서 직접 접근할 수 없습니다.
- 그렇다면 **관리자가 앱 서버에 SSH로 들어가야 할 때**는 어떻게 할까요? 여기서 Bastion Host가 필요합니다.

## Bastion Host란

Bastion Host는 외부에서 private 네트워크로 들어가기 위한 **단 하나의 관문 서버**입니다. Jump Server, Jump Box라고도 부릅니다. 성의 망루(bastion)처럼 바깥에 노출되는 대신 철저히 지키는 지점입니다.

```text
내 PC ──SSH──▶ Bastion (public subnet) ──SSH──▶ App Server (private subnet)
```

private 서버마다 public IP와 SSH 포트를 여는 대신, 입구를 Bastion 하나로 모읍니다. 그 결과는 다음과 같습니다.

- 공격 표면이 Bastion 한 대로 줄어듭니다.
- 접속 로그와 접근 제어를 한 곳에서 관리할 수 있습니다.
- private 서버는 계속 외부와 단절된 상태를 유지합니다.

### 보안 그룹 설정

Bastion 구성의 핵심은 보안 그룹을 체인처럼 연결하는 것입니다.

| 보안 그룹 | 인바운드 규칙 |
| --- | --- |
| `bastion-sg` | TCP 22, 출발지: **회사·집 IP**(예: `203.0.113.10/32`) |
| `app-sg` | TCP 22, 출발지: **`bastion-sg`** |
| `db-sg` | TCP 5432, 출발지: `app-sg` (필요하면 `bastion-sg` 추가) |

`app-sg`의 출발지를 IP가 아니라 `bastion-sg`로 지정하면, Bastion을 다시 만들어 IP가 바뀌어도 규칙을 고칠 필요가 없습니다.

> Bastion의 SSH를 `0.0.0.0/0`으로 열어 두면 관문을 만든 의미가 거의 사라집니다. 접속할 IP만 열어 두세요.

### 접속 방법

private 서버의 키를 Bastion에 복사해 두는 방식은 피합니다. Bastion이 털리면 키도 함께 털리기 때문입니다. 대신 SSH의 **ProxyJump**(`-J`)를 쓰면 키는 내 PC에만 두고 Bastion을 거쳐 바로 접속할 수 있습니다.

```bash
ssh -J ec2-user@<bastion-public-ip> ec2-user@10.0.11.25
```

자주 쓴다면 `~/.ssh/config`에 적어 둡니다.

```text
Host bastion
  HostName 203.0.113.50
  User ec2-user
  IdentityFile ~/.ssh/my-key.pem

Host app-1
  HostName 10.0.11.25
  User ec2-user
  IdentityFile ~/.ssh/my-key.pem
  ProxyJump bastion
```

이제 `ssh app-1` 한 줄로 접속됩니다.

private 서브넷의 DB에 로컬 DB 클라이언트로 붙고 싶을 때는 포트 포워딩을 씁니다.

```bash
# 내 PC의 15432 포트 → Bastion → RDS 5432
ssh -N -L 15432:mydb.xxxx.ap-northeast-2.rds.amazonaws.com:5432 bastion
```

DB 클라이언트에서 `localhost:15432`로 접속하면 됩니다.

### 운영할 때 챙길 것

- Bastion에는 접속 용도 외의 프로그램을 올리지 않습니다.
- 작은 인스턴스(t3.micro, t4g.nano 등)로 충분하고, 쓰지 않을 때는 꺼 두는 것도 방법입니다.
- 운영체제 보안 패치를 꾸준히 적용합니다.
- 접속 기록을 남기고 CloudWatch 등으로 수집합니다.

## Bastion 없이 접속하는 방법

최근에는 Bastion 자체를 두지 않는 구성도 많습니다.

- **AWS Systems Manager Session Manager**: 인스턴스에 SSM 에이전트와 IAM 역할만 있으면 콘솔이나 CLI로 셸에 들어갈 수 있습니다. 22번 포트를 열 필요가 없고, 권한은 IAM으로 관리하며, 세션 기록도 남습니다.
- **EC2 Instance Connect Endpoint**: VPC 안에 엔드포인트를 만들어 public IP 없이 private 인스턴스에 SSH로 접속합니다.

Bastion은 여전히 흔하고 개념적으로도 중요하지만, 새로 구성한다면 위 방법들을 먼저 검토해 볼 만합니다.

## 정리

- **VPC**는 클라우드 안의 격리된 네트워크이고, 서브넷·라우팅 테이블·게이트웨이로 외부와의 연결을 직접 설계합니다.
- 서브넷이 public인지 private인지는 **라우팅 테이블에 IGW 경로가 있는지**로 결정됩니다.
- private 서버가 밖으로 나갈 때는 **NAT Gateway**를 거칩니다.
- **Bastion Host**는 private 서버에 들어가기 위한 단일 관문입니다. 보안 그룹을 `내 IP → bastion-sg → app-sg` 순서로 연결하고, 키는 ProxyJump로 내 PC에만 둡니다.
