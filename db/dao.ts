import { count, desc, eq, and } from "drizzle-orm";
import { DrizzleD1Database as Database } from 'drizzle-orm/d1';
import { emails, InsertEmail } from "./schema";

export async function insertEmail(db: Database, email: InsertEmail) {
    try {
        await db.insert(emails).values(email).execute();
    } catch (e) {
        console.error(e);
    }
}

export async function getEmails(db: Database) {
    try {
        return await db.select().from(emails).execute();
    } catch (e) {
        return [];
    }
}

export async function getEmail(db: Database, id: string) {
    try {
        const result = await db
            .select()
            .from(emails)
            .where(and(eq(emails.id, id)))
            .execute();
        if (result.length != 1) {
            return null;
        }
        return result[0];
    } catch (e) {
        return null;
    }
}

export async function getEmailByPassword(db: Database, id: string) {
    try {
        const result = await db
            .select({ messageTo: emails.messageTo })
            .from(emails)
            .where(and(eq(emails.id, id)))
            .limit(1)
            .execute();
        return result[0];
    } catch (e) {
        return null;
    }
}

export async function getEmailsByMessageTo(
    db: Database,
    messageTo: string
) {
    try {
        return await db
            .select()
            .from(emails)
            .where(eq(emails.messageTo, messageTo))
            .orderBy(desc(emails.createdAt))
            .execute();
    } catch (e) {
        return [];
    }
}

export async function getEmailsCount(db: Database) {
    try {
        const res = await db.select({ count: count() }).from(emails);
        return res[0]?.count;
    } catch (e) {
        return 0;
    }
}
