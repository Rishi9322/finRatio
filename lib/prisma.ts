import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

let prisma: PrismaClient | undefined

export async function getPrisma() {
  if (!prisma) {
    const adapter = await new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL || "file:./dev.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    }).connect()

    prisma = new PrismaClient({ adapter: adapter as never })
  }

  return prisma
}
