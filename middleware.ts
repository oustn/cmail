import {NextApiRequest, NextApiResponse} from "next";

export async function middleware(req: NextApiRequest, res: NextApiResponse) {
    const { auth } = await import('auth')
    return auth(req, res)
}

// Or like this if you need to do something here.
// export default auth((req) => {
//   console.log(req.auth) //  { session: { user: { ... } } }
// })

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
