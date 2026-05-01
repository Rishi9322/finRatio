import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

let prisma: PrismaClient | undefined

export async function getPrisma() {
  if (!prisma) {
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:./dev.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)
    prisma = new PrismaClient({ adapter })
  }

  return prisma
}
