import PostalMime from 'postal-mime';
import {nanoid} from 'nanoid/non-secure';

import {getDB, InsertEmail, insertEmailSchema, insertEmail} from '@/db'

const worker = {
    async email(message: ForwardableEmailMessage, env: CloudflareEnv, ctx: ExecutionContext) {
        try {
            const db = getDB(env.DB)
            const messageFrom = message.from;
            const messageTo = message.to;
            const rawText = await new Response(message.raw).text();
            const mail = await new PostalMime().parse(rawText);
            const now = new Date();
            const newEmail: InsertEmail = {
                id: nanoid(),
                messageFrom,
                messageTo,
                ...mail,
                createdAt: now,
                updatedAt: now,
            } as InsertEmail
            const email = insertEmailSchema.parse(newEmail);
            await insertEmail(db, email);
        } catch (e) {
            console.log(e);
        }
    }
}

export default worker
