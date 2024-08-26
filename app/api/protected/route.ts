import {NextRequest} from "next/server";

export const runtime = 'edge'

export const GET = async (req: NextRequest) => {
  const { auth } = await import ('auth')
  return (auth((req) => {
    if (req.auth) {
      return Response.json({ data: "Protected data" })
    }

    return Response.json({ message: "Not authenticated" }, { status: 401 })
  }) as any)(req)
}
