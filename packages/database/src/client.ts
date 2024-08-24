import { PrismaClient } from "@prisma/client";
import { getRequestContext } from '@cloudflare/next-on-pages';
import { PrismaD1 } from "@prisma/adapter-d1";

type PrismaThis = typeof global & { prisma: PrismaClient }

const { env } = getRequestContext();
const adapter = new PrismaD1(env.DB);
const prisma =  (global as PrismaThis).prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    (global as PrismaThis).prisma = prisma
}

export {
    prisma
}

export * from "@prisma/client";
