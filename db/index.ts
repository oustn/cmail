import { drizzle } from 'drizzle-orm/d1';
import {D1Database} from "@cloudflare/workers-types";

export * from './schema'
export * from './dao'

export function getDB(db: D1Database) {
    return drizzle(db)
}
