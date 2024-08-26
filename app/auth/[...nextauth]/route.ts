import {NextRequest} from "next/server";

export const runtime = 'edge'

export const GET = async (req: NextRequest) => {
    const { handlers } = await import('auth')
    return handlers.GET(req)
}

export const POST = async (req: NextRequest) => {
    const { handlers } = await import('auth')
    return handlers.POST(req)
}
