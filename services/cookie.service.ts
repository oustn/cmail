import { createCookie } from "@/lib/cookie";

const secrets = (process.env.AUTH_SECRET || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const userMailboxCookie = createCookie("mailbox", {
    maxAge: Number(process.env.EXPIRY_TIME) || 86400, // default for one day (86400 seconds)
    secrets: secrets,
    httpOnly: true,
});
