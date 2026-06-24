import { Pool, type PoolConfig } from "pg"

export const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL ?? null

function shouldUseSsl() {
  if (!connectionString) {
    return false
  }

  if (connectionString.includes("localhost") || connectionString.includes("127.0.0.1")) {
    return false
  }

  return true
}

// 로컬은 평문, 배포용 Postgres/Neon은 SSL로 연결하는 공통 Pool 설정입니다.
export function createDbPool() {
  if (!connectionString) {
    return null
  }

  const config: PoolConfig = {
    connectionString,
  }

  if (shouldUseSsl()) {
    config.ssl = {
      rejectUnauthorized: false,
    }
  }

  return new Pool(config)
}
