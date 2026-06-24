# heru_knotInspector

heru 매듭 검사 및 작업자 운영 지원 프로그램입니다.

## 실행 환경 분리

이 프로젝트는 브랜치를 나누지 않고 환경변수로 실행 환경을 구분합니다.

- 로컬 개발: `.env.local` + Docker Postgres
- 운영 배포: Vercel Environment Variables + 운영용 Postgres/Neon

같은 코드베이스를 유지하고, DB 연결 대상만 바꿔서 사용합니다.

## 환경변수

기본 예시는 [.env.example](/Users/gyunhee/Desktop/knotInspector/.env.example) 파일에 있습니다.

사용하는 환경변수:

- `DATABASE_URL`
- `POSTGRES_URL`
- 선택: `POSTGRES_PRISMA_URL`

현재 코드는 위 3개 중 하나라도 있으면 DB 연결을 시도합니다.

## 로컬 개발

### 1. 환경변수 준비

`.env.example`을 참고해서 `.env.local`을 준비합니다.

예시:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/knot_attendance
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/knot_attendance
```

### 2. Docker DB 실행

```bash
docker compose up -d
```

`docker-compose.yml`에는 앱과 Postgres가 함께 정의되어 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

## 운영 배포

### 권장 방식

- 프론트: Vercel
- DB: Neon Postgres 또는 외부 Postgres

### Vercel 환경변수 설정

Vercel 프로젝트에 아래 값을 넣으면 됩니다.

```env
DATABASE_URL=운영용 Postgres 연결 문자열
POSTGRES_URL=운영용 Postgres 연결 문자열
```

보통 두 변수에 같은 값을 넣어도 됩니다.

### 운영 DB 연결 주의사항

프로젝트는 로컬 DB와 운영 DB를 자동 구분합니다.

- `localhost`, `127.0.0.1` 연결: SSL 없이 접속
- 외부 호스트 연결: SSL 사용

그래서 로컬 도커 DB와 Vercel/Neon 배포 DB를 같은 코드로 함께 사용할 수 있습니다.

## 테이블 생성 방식

이 프로젝트는 별도 migration 스크립트 없이, 각 기능에 처음 접근할 때 필요한 테이블을 자동 생성합니다.

예를 들어 아래 기능 사용 시 관련 테이블이 생성됩니다.

- 작업자 관리
- 출퇴근
- 공지
- 신고
- 가이드
- 일일 목표
- 촬영 등록 이력

## 자주 사용하는 명령어

```bash
npm run dev
npm run build
docker compose up -d
docker compose down
```

## 운영 팁

- 로컬 개발용 `.env.local`은 도커 DB 기준으로 유지합니다.
- 운영용 DB 정보는 Vercel Dashboard의 Environment Variables에만 넣습니다.
- 운영 DB 연결 테스트 전에는 `npm run build`로 타입/빌드 오류를 먼저 확인하는 것을 권장합니다.
