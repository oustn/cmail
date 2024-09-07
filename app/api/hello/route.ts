import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import {emails, getDB, getEmails} from "@/db";

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { env } = getRequestContext()
  const db = getDB(env.DB)
  const result = await getEmails(db)
  return Response.json(result);
}
