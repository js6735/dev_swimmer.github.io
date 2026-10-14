---
title: Husky로 Git Hook 관리하기
date: 2026-10-14
tags: [Git, Husky, lint-staged, commitlint]
summary: Git Hook의 개념과 Husky로 팀 전체가 같은 훅을 쓰는 방법, lint-staged·commitlint와 함께 쓰는 설정을 정리했습니다.
---

커밋하기 전에 린트를 돌리거나 커밋 메시지 형식을 맞추는 일은 사람에게 맡기면 금방 빠뜨립니다. Git에는 이런 작업을 자동으로 실행하는 **Git Hook**이 있고, 이 훅을 팀 전체가 똑같이 쓰도록 도와주는 도구가 **Husky**입니다. 이 글은 Husky v9를 기준으로 정리했습니다.

## Git Hook이란

Git Hook은 커밋이나 푸시 같은 Git 동작의 특정 시점에 자동으로 실행되는 스크립트입니다. 저장소의 `.git/hooks/` 폴더에 정해진 이름으로 실행 파일을 두면 Git이 알아서 호출합니다.

| 훅 | 실행 시점 | 주로 하는 일 |
| --- | --- | --- |
| pre-commit | 커밋이 만들어지기 직전 | 린트, 포맷팅, 타입 검사 |
| prepare-commit-msg | 커밋 메시지 편집기가 열리기 전 | 브랜치 이름으로 메시지 미리 채우기 |
| commit-msg | 커밋 메시지를 쓴 직후 | 커밋 메시지 형식 검사 |
| pre-push | 푸시하기 직전 | 테스트, 빌드 확인 |
| post-merge | merge/pull이 끝난 뒤 | 의존성이 바뀌었으면 다시 설치 |

훅 스크립트가 0이 아닌 값으로 끝나면(실패하면) Git은 그 동작을 멈춥니다. pre-commit에서 린트가 실패하면 커밋 자체가 만들어지지 않는 식입니다.

### .git/hooks의 한계

문제는 `.git/` 폴더가 **버전 관리 대상이 아니라는 점**입니다. 내 컴퓨터에 훅을 만들어 둬도 저장소에 올라가지 않으니, 팀원은 각자 직접 훅을 복사해 넣어야 합니다. 새로 합류한 사람은 훅이 있는지조차 모르기 쉽습니다.

## Husky가 해결하는 것

Husky는 훅 스크립트를 저장소 안의 `.husky/` 폴더에 두고, Git이 그 폴더를 훅 위치로 쓰도록 설정해 줍니다.

- 훅 파일이 `.husky/`에 있으므로 **저장소에 함께 커밋**됩니다.
- `npm install`을 하면 `prepare` 스크립트가 Husky를 실행해 **훅이 자동으로 연결**됩니다.
- 그래서 팀원은 저장소를 받고 의존성만 설치하면 같은 훅을 쓰게 됩니다.

내부적으로는 Git의 `core.hooksPath` 설정을 `.husky/_`로 바꿔서, Git이 `.git/hooks/` 대신 Husky가 만든 폴더를 보도록 합니다.

```bash
git config core.hooksPath
# .husky/_
```

## 설치

```bash
npm install --save-dev husky
npx husky init
```

yarn을 쓴다면 설치만 `yarn add -D husky`로 바꾸면 됩니다.

`husky init`은 두 가지를 해 줍니다.

1. `package.json`에 `prepare` 스크립트를 추가합니다.
2. `.husky/pre-commit` 파일을 예시로 만들어 둡니다.

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

`prepare`는 `npm install`이 끝날 때 자동으로 실행되는 npm의 생명주기 스크립트입니다. 덕분에 팀원이 따로 명령을 실행하지 않아도 훅이 연결됩니다.

## 훅 작성하기

`.husky/` 아래에 **훅 이름과 같은 파일**을 만들고, 그 안에 실행할 명령을 적으면 됩니다.

```bash
# .husky/pre-commit
npm run lint
```

```bash
# .husky/pre-push
npm test
```

v9부터는 파일 첫 줄의 `#!/usr/bin/env sh`나 `. "$(dirname -- "$0")/_/husky.sh"` 같은 줄이 필요 없습니다. 예전 글에 나오는 `npx husky add` 명령도 v9에서 없어졌으니, 파일을 직접 만들면 됩니다.

```bash
echo "npm test" > .husky/pre-push
```

만든 훅 파일은 다른 코드와 똑같이 커밋해서 팀과 공유합니다. `.husky/_` 폴더는 Husky가 설치할 때마다 새로 만드는 폴더이고, 안에 `.gitignore`가 있어 커밋되지 않습니다.

## lint-staged와 함께 쓰기

pre-commit에서 `npm run lint`를 그대로 돌리면 프로젝트 **전체**를 검사하므로 프로젝트가 커질수록 커밋이 느려집니다. 이번 커밋에 포함된 파일만 검사하려면 **lint-staged**를 함께 씁니다.

```bash
npm install --save-dev lint-staged
```

`package.json`에 파일 패턴별로 실행할 명령을 적습니다.

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": "prettier --write"
  }
}
```

그리고 pre-commit 훅에서 lint-staged를 실행합니다.

```bash
# .husky/pre-commit
npx lint-staged
```

lint-staged는 스테이징된 파일에만 명령을 실행하고, `--fix`나 `--write`로 고쳐진 내용은 다시 스테이징해서 커밋에 포함시킵니다. 고칠 수 없는 에러가 남아 있으면 커밋이 중단됩니다.

## commitlint로 커밋 메시지 검사하기

`feat: ...`, `fix: ...` 같은 Conventional Commits 형식을 강제하고 싶다면 commit-msg 훅에 **commitlint**를 연결합니다.

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

프로젝트 루트에 설정 파일을 만듭니다.

```js
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
};
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

commit-msg 훅은 커밋 메시지가 담긴 임시 파일의 경로를 첫 번째 인자(`$1`)로 받습니다. commitlint는 그 파일을 읽어 형식을 검사하고, 맞지 않으면 커밋을 막습니다.

```text
$ git commit -m "로그인 수정"
⧗   input: 로그인 수정
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
```

## 훅 건너뛰기

급하게 커밋해야 하거나 훅이 잘못 동작할 때는 잠시 건너뛸 수 있습니다.

```bash
# 이번 커밋만 pre-commit, commit-msg 훅을 건너뜀
git commit -m "wip" --no-verify   # 또는 -n

# Husky가 연결한 모든 훅을 끔
HUSKY=0 git push
```

`--no-verify`는 pre-push에도 쓸 수 있습니다. 다만 습관이 되면 훅을 둔 의미가 없어지므로, 건너뛴 검사는 나중에 꼭 다시 돌리는 게 좋습니다.

## CI와 배포 환경

CI 서버나 Docker 빌드에서는 훅이 필요 없습니다. 이때는 환경 변수 `HUSKY=0`을 설정하면 `prepare` 단계에서 Husky가 아무것도 하지 않습니다.

```yaml
# GitHub Actions 예시
env:
  HUSKY: 0
```

`npm install --omit=dev`처럼 devDependencies를 설치하지 않는 환경에서는 `husky` 명령 자체가 없어서 `prepare`가 실패합니다. 이럴 때는 `HUSKY=0`을 쓰거나, 실패해도 넘어가도록 스크립트를 바꿉니다.

```json
{
  "scripts": {
    "prepare": "husky || true"
  }
}
```

## 훅이 실행되지 않을 때

- **`prepare`가 실행되지 않은 경우**: Husky를 설치하기 전에 받은 저장소라면 `npm install`을 한 번 더 실행합니다. `git config core.hooksPath`가 `.husky/_`로 나오는지 확인합니다.
- **파일 이름이 틀린 경우**: `.husky/pre-commit.sh`처럼 확장자를 붙이면 Git이 훅으로 인식하지 않습니다. 훅 이름 그대로 만들어야 합니다.
- **GUI 클라이언트에서 `npx`를 못 찾는 경우**: SourceTree 같은 GUI 앱은 터미널과 PATH가 달라서 node를 찾지 못할 수 있습니다. `~/.config/husky/init.sh`에 nvm 설정 같은 PATH 설정을 넣어 두면 Husky가 훅을 실행하기 전에 불러옵니다.

## 정리

- Git Hook은 커밋·푸시 시점에 자동으로 실행되는 스크립트지만, `.git/hooks/`는 저장소에 올라가지 않아 팀과 공유하기 어렵습니다.
- Husky는 훅을 `.husky/`에 두고 `core.hooksPath`로 연결해서, `npm install`만으로 팀 전체가 같은 훅을 쓰게 해 줍니다.
- pre-commit에는 lint-staged로 바뀐 파일만 검사하고, commit-msg에는 commitlint로 메시지 형식을 검사하는 조합을 많이 씁니다.
- CI에서는 `HUSKY=0`으로 끄고, 급할 때는 `--no-verify`로 건너뛸 수 있습니다.
