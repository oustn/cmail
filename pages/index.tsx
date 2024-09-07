import {GetServerSideProps, InferGetServerSidePropsType} from "next";
import { userMailboxCookie } from '@/services'

export const runtime = 'experimental-edge'

interface IndexProps {
    mailbox?: string
    emails: Array<string>
}

export const getServerSideProps = (async (context) => {
    const mailbox: string  = await userMailboxCookie.parse(context.req.headers.cookie ?? '')

    return {props: {mailbox, emails: []}}
}) satisfies GetServerSideProps<IndexProps>

export default function Index({ emails, mailbox }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <div className="flex flex-col gap-6">
            { emails }
            { mailbox }
            <h1 className="text-3xl font-bold">NextAuth.js Example</h1>
        </div>
    )
}
