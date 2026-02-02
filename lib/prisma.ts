import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}
const globalForPool = globalThis as unknown as {
  pgPool?: Pool
}

const databaseUrl = process.env.DATABASE_URL
const useAccelerate = databaseUrl?.startsWith("prisma+postgres://")

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    if (useAccelerate && databaseUrl) {
      return new PrismaClient({
        accelerateUrl: databaseUrl,
        log: ["error"],
      })
    }

    const pool =
      globalForPool.pgPool ??
      new Pool({
        connectionString: databaseUrl,
      })

    if (!globalForPool.pgPool) {
      globalForPool.pgPool = pool
    }

    const adapter = new PrismaPg(pool)
    return new PrismaClient({
      adapter,
      log: ["error"],
    })
  })()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
