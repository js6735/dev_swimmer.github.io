---
title: 리눅스 명령어 정리
date: 2026-10-14
tags: [linux, command]
summary: 일하면서 알게 된 리눅스 명령어를 분석하고 정리해둔 공간
---

익숙하지 않은 리눅스 명령어를 사용하다보면, 사용할때만 순간적으로 이해하고 이후에는 명령어가 어떤 동작을 하는지 잊을 때가 많습니다. 그래서 알게 된, 사용해본 명령어에 대해 정리하려고 합니다. 

# awk / cat / grep / pgrep 명령어 정리

알파벳 순서: [awk](#awk) → [cat](#cat) → [grep](#grep) → [pgrep](#pgrep)

---

## awk

줄을 **필드(열) 단위로 쪼개서 처리**하는 작은 프로그래밍 언어. 기본 구조는 아래와 같다.

```
awk 'BEGIN{시작 전} 조건{동작} END{끝난 후}' file
```

```bash
awk '{print $1}' file.txt                # 첫 번째 열 출력
awk '/ERROR/ {print $0}' log.txt         # ERROR 포함된 줄 출력
awk '$3 > 100 {print $1, $3}' data.txt   # 3번째 열이 100 초과인 줄만
```

### 기본 옵션

| 옵션 | 설명 |
|---|---|
| `-F':'` | 필드 구분자 지정 (기본은 공백/탭) |
| `-v var=값` | 외부 변수를 awk 안으로 전달 |
| `-f script.awk` | 스크립트 파일에서 코드 읽기 |

```bash
awk -F':' '{print $1}' /etc/passwd            # 콜론 기준으로 계정명 출력
awk -v min=50 '$2 > min {print $1}' data.txt
```

### 내장 변수

| 변수 | 의미 |
|---|---|
| `$0` | 현재 줄 전체 |
| `$1`, `$2`... | 1번째, 2번째... 필드 |
| `$NF` | 마지막 필드 |
| `NF` | 현재 줄의 필드 개수 |
| `NR` | 현재까지 읽은 줄 번호 (전체 기준) |
| `FNR` | 현재 파일 기준 줄 번호 |
| `FS` | 입력 필드 구분자 |
| `OFS` | 출력 필드 구분자 |
| `FILENAME` | 현재 읽는 파일 이름 |

### 조건 연산자

`==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`(and), `||`(or), `~`(정규식 일치), `!~`(정규식 불일치)

### 자주 쓰는 패턴

```bash
awk 'NR==5' file                           # 5번째 줄만
awk 'NR>=2 && NR<=5' file                  # 2~5번째 줄
awk 'NF' file                              # 빈 줄 제외
awk '{print $NF}' file                     # 마지막 열
awk '{sum+=$2} END{print sum}' file        # 2번째 열 합계
awk '{sum+=$2} END{print sum/NR}' file     # 평균
awk '!seen[$0]++' file                     # 중복 줄 제거 (순서 유지)
awk 'BEGIN{OFS=","} {print $1,$2}' file    # 출력 구분자를 쉼표로
awk 'length($0) > 80' file                 # 80자 넘는 줄
awk 'tolower($1)=="host" {print $2}' file  # 대소문자 무시 비교
```

---

## cat

파일 내용을 **이어 붙여서 출력**하는 도구. 이름은 concatenate에서 왔다.

```bash
cat file.txt               # 내용 출력
cat a.txt b.txt            # 두 파일을 이어서 출력
cat a.txt b.txt > all.txt  # 합쳐서 새 파일로 저장
cat >> log.txt             # 입력한 내용을 파일 끝에 추가 (Ctrl+D로 종료)
```

### 옵션

| 옵션 | 설명 |
|---|---|
| `-n` | 모든 줄에 줄 번호 표시 |
| `-b` | 빈 줄 제외하고 줄 번호 표시 |
| `-s` | 연속된 빈 줄을 하나로 압축 |
| `-A` | 보이지 않는 문자까지 표시 (탭은 `^I`, 줄 끝은 `$`) |
| `-E` | 줄 끝에 `$` 표시 |
| `-T` | 탭을 `^I`로 표시 |

> 큰 파일은 `cat` 대신 `less`(스크롤), `head`(앞부분), `tail`(뒷부분)이 더 적합하다.

---

## grep

파일이나 입력에서 **패턴에 맞는 줄을 찾아 출력**한다.

```bash
grep '패턴' file.txt
grep -rn 'TODO' ./src        # 폴더 전체에서 재귀 검색 + 줄 번호
cat log.txt | grep 'ERROR'   # 파이프로 받은 입력에서 검색
```

### 매칭 방식

| 옵션 | 설명 |
|---|---|
| `-i` | 대소문자 무시 |
| `-v` | 패턴에 **맞지 않는** 줄만 출력 (반전) |
| `-w` | 단어 단위로 정확히 일치 |
| `-x` | 줄 전체가 일치 |
| `-E` | 확장 정규식 사용 (`\|`, `+`, `?`, `()` 등), `egrep`과 동일 |
| `-F` | 정규식 아닌 문자열 그대로 검색 (특수문자 많을 때 유용) |
| `-P` | Perl 정규식 (GNU grep, macOS 기본 grep은 미지원) |
| `-e` | 패턴 여러 개 지정 (`-e a -e b`) |

### 출력 제어

| 옵션 | 설명 |
|---|---|
| `-n` | 줄 번호 표시 |
| `-c` | 일치하는 줄 **개수**만 출력 |
| `-o` | 줄 전체가 아니라 **일치한 부분만** 출력 |
| `-l` | 일치하는 **파일 이름**만 출력 |
| `-L` | 일치하지 않는 파일 이름만 출력 |
| `-h` | 파일명 표시 생략 |
| `-q` | 출력 없이 종료 코드만 반환 (스크립트 조건문용) |
| `--color` | 일치 부분 색상 강조 |

### 주변 줄 보기

| 옵션 | 설명 |
|---|---|
| `-A n` | 일치한 줄 **뒤** n줄도 출력 (After) |
| `-B n` | 일치한 줄 **앞** n줄도 출력 (Before) |
| `-C n` | 앞뒤 n줄씩 출력 (Context) |

### 파일 범위

| 옵션 | 설명 |
|---|---|
| `-r` | 하위 디렉터리까지 재귀 검색 |
| `--include='*.js'` | 특정 파일만 검색 |
| `--exclude='*.log'` | 특정 파일 제외 |
| `--exclude-dir=node_modules` | 특정 폴더 제외 |

### 정규식 기초

| 기호 | 의미 |
|---|---|
| `^` | 줄의 시작 |
| `$` | 줄의 끝 |
| `.` | 아무 문자 1개 |
| `*` | 앞 문자 0번 이상 반복 |
| `[abc]` | a, b, c 중 하나 |
| `[0-9]` | 숫자 하나 |
| `[^abc]` | a, b, c를 **제외한** 문자 하나 |
| `\` | 특수문자를 일반 문자로 (`\.`은 점 그대로) |

`-E`를 쓰면 아래 기호도 역슬래시 없이 쓸 수 있다.

| 기호 | 의미 |
|---|---|
| `+` | 앞 문자 1번 이상 반복 |
| `?` | 앞 문자 0번 또는 1번 |
| `{n,m}` | 앞 문자 n~m번 반복 |
| `a\|b` | a 또는 b |
| `( )` | 묶음 |

### 자주 쓰는 패턴

```bash
grep -i 'error' app.log                          # 대소문자 상관없이 error 찾기
grep -v '^#' nginx.conf | grep -v '^$'           # 주석과 빈 줄 빼고 설정만 보기
grep -E 'ERROR|WARN' app.log                     # ERROR 또는 WARN
grep -c 'ERROR' app.log                          # ERROR 몇 줄인지
grep -oE '[0-9]{1,3}(\.[0-9]{1,3}){3}' access.log  # IP 주소만 뽑기
grep -rn --exclude-dir=node_modules 'TODO' .     # node_modules 빼고 TODO 찾기
grep -rl 'apiKey' ./src                          # apiKey가 들어간 파일 목록만
grep -C 3 'Exception' app.log                    # 예외 앞뒤 3줄까지 같이 보기
tail -f app.log | grep --line-buffered 'ERROR'   # 실시간 로그에서 ERROR만 보기
```

### 종료 코드

| 코드 | 의미 |
|---|---|
| `0` | 일치하는 줄이 있음 |
| `1` | 일치하는 줄이 없음 |
| `2` | 에러 (파일 없음, 잘못된 옵션 등) |

`-q`와 함께 쓰면 스크립트에서 조건으로 쓰기 좋다.

```bash
if grep -q 'ERROR' app.log; then
  echo "에러 있음"
fi
```

### ps | grep의 함정

프로세스를 찾을 때 `ps aux | grep nginx`를 많이 쓰는데, 결과에 **grep 자기 자신**도 같이 나온다.

```bash
$ ps aux | grep nginx
root   1021  ...  nginx: master process /usr/sbin/nginx
www    1022  ...  nginx: worker process
user   5310  ...  grep nginx              # ← grep 자신
```

`grep '[n]ginx'`처럼 첫 글자를 대괄호로 감싸면 정규식은 여전히 `nginx`와 일치하지만, grep 명령어 문자열(`[n]ginx`)과는 일치하지 않아서 자기 자신이 빠진다. 다만 프로세스를 찾는 게 목적이라면 처음부터 아래의 `pgrep`을 쓰는 편이 깔끔하다.

```bash
ps aux | grep '[n]ginx'
ps aux | grep nginx | grep -v grep   # 같은 효과, 조금 더 장황한 방식
```

---

## pgrep

**실행 중인 프로세스를 이름이나 조건으로 찾아 PID를 출력**한다. 이름은 process + grep에서 왔다. `ps | grep`과 달리 자기 자신은 결과에 나오지 않는다.

```bash
pgrep nginx          # nginx가 이름에 포함된 프로세스의 PID
pgrep -l nginx       # PID + 프로세스 이름
pgrep -af node       # PID + 전체 명령줄, 인자까지 포함해서 검색
```

```bash
$ pgrep -l nginx
1021 nginx
1022 nginx
```

패턴은 grep처럼 정규식(확장 정규식)으로 해석된다. 그래서 `pgrep nginx`는 이름에 nginx가 **포함된** 프로세스를 모두 찾는다.

### 검색 방식

| 옵션 | 설명 |
|---|---|
| `-f` | 프로세스 이름이 아니라 **전체 명령줄**(인자 포함)에서 검색 |
| `-x` | 이름이 패턴과 **정확히** 일치하는 것만 |
| `-i` | 대소문자 무시 |
| `-v` | 패턴에 맞지 않는 프로세스만 (반전) |

### 출력 제어

| 옵션 | 설명 |
|---|---|
| `-l` | PID와 프로세스 이름 함께 출력 |
| `-a` | PID와 **전체 명령줄** 함께 출력 (Linux) |
| `-c` | 일치하는 프로세스 **개수**만 출력 |
| `-d ','` | PID 구분자 지정 (기본은 줄바꿈) |
| `-n` | 가장 **최근에** 시작된 프로세스 하나만 |
| `-o` | 가장 **오래된** 프로세스 하나만 |

### 조건으로 좁히기

| 옵션 | 설명 |
|---|---|
| `-u user` | 해당 사용자(유효 UID)의 프로세스만 |
| `-U user` | 해당 사용자(실제 UID)의 프로세스만 |
| `-P pid` | 해당 PID를 **부모**로 둔 프로세스만 (자식 찾기) |
| `-g pgid` | 해당 프로세스 그룹만 |
| `-t tty` | 해당 터미널에 붙은 프로세스만 |

### -f가 필요한 경우

리눅스에서 기본 검색 대상인 프로세스 이름은 **최대 15자**로 잘려 있고, 실행 파일 이름만 담고 있다. 그래서 아래처럼 인자나 긴 이름으로 찾을 때는 `-f`가 필요하다.

```bash
pgrep python                 # python으로 실행된 모든 프로세스
pgrep -f 'python app.py'     # app.py를 실행 중인 python만
pgrep -f 'java.*my-server'   # 특정 jar를 띄운 java 프로세스
```

> `-f`는 전체 명령줄을 보기 때문에 패턴이 너무 짧으면 엉뚱한 프로세스까지 걸린다. `-af`로 먼저 무엇이 잡히는지 확인하는 습관을 들이자.

### 자주 쓰는 패턴

```bash
pgrep -x nginx                       # 이름이 정확히 nginx인 것만
pgrep -u www-data -l                 # www-data 사용자의 프로세스
pgrep -c -f 'node server.js'         # 몇 개 떠 있는지
pgrep -n -f gunicorn                 # 가장 최근에 뜬 gunicorn
pgrep -P "$(pgrep -o -x nginx)"      # nginx master의 자식(worker) 프로세스
ps -fp "$(pgrep -d, -x nginx)"       # 찾은 PID들의 상세 정보를 ps로 보기
kill "$(pgrep -o -f 'node server.js')"  # 찾아서 종료
```

### 종료 코드

| 코드 | 의미 |
|---|---|
| `0` | 일치하는 프로세스가 있음 |
| `1` | 일치하는 프로세스가 없음 |
| `2` | 명령어 문법 오류 |
| `3` | 치명적 오류 |

스크립트에서 "이미 실행 중이면 건너뛰기" 같은 처리에 쓰기 좋다.

```bash
if pgrep -x nginx > /dev/null; then
  echo "nginx 실행 중"
else
  echo "nginx 꺼져 있음"
fi
```

### pkill

`pgrep`과 옵션이 같은 짝꿍 명령어로, 찾은 프로세스에 **시그널을 보낸다**(기본은 `SIGTERM`).

```bash
pkill -x nginx            # nginx 종료 요청
pkill -f 'python app.py'  # app.py 실행 중인 python 종료
pkill -9 -f 'stuck-job'   # 강제 종료 (SIGKILL)
pkill -HUP -x nginx       # 설정 다시 읽기 (SIGHUP)
```

> `pkill`은 확인 없이 바로 시그널을 보낸다. 같은 옵션으로 `pgrep -a`를 먼저 실행해서 대상이 맞는지 확인한 뒤 `pkill`로 바꾸는 게 안전하다.

### macOS와의 차이

macOS에도 `pgrep`이 있지만 BSD 계열이라 일부 옵션이 다르다.

- `-a`: Linux는 "전체 명령줄 출력", macOS는 "상위(조상) 프로세스도 결과에 포함"으로 의미가 다르다. macOS에서 전체 명령줄을 보려면 `pgrep -lf`를 쓴다.
- `-c`(개수 출력)는 macOS에 없다. `pgrep 패턴 | wc -l`로 대신한다.

---

## 한눈에 비교

| | awk | cat | grep | pgrep |
|---|---|---|---|---|
| 역할 | 필드 단위 추출/가공/계산 | 파일 내용 출력/연결 | 패턴에 맞는 줄 검색 | 조건에 맞는 프로세스 검색 |
| 단위 | 줄 + 필드 | 파일 | 줄 | 프로세스 |
| 이럴 때 | 특정 열 뽑기, 합계/통계 | 내용 확인, 파일 합치기 | 로그에서 키워드 찾기 | PID 찾기, 실행 여부 확인 |

### 파이프 조합 예시

```bash
cat access.log | grep 'ERROR' | awk '{print $1}'   # ERROR 줄에서 첫 번째 열 추출
grep 'ERROR' access.log | awk '{print $1}'         # cat 없이도 동일한 결과
ps aux | grep '[n]ginx' | awk '{print $2}'         # nginx PID 추출
pgrep nginx                                        # 위와 같은 결과를 한 번에
```