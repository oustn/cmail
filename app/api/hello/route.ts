import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { drizzle } from 'drizzle-orm/d1';
import {emails} from "@/db/schema";

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { env } = getRequestContext()
  const db = drizzle(env.DB)
  const result = await db.select().from(emails).all()
  return Response.json(result);
}
