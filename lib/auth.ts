import type {NextAuthConfig} from "next-auth"
import NextAuth from "next-auth"
import "next-auth/jwt"
import GitHub from "next-auth/providers/github"
import {createStorage} from "unstorage"
import cloudflareKVDriver from "unstorage/drivers/cloudflare-kv-binding"
import {UnstorageAdapter} from "@auth/unstorage-adapter"
import {getRequestContext} from '@cloudflare/next-on-pages'

import {isDev} from '@/lib/utils'

const {env} = getRequestContext()

const storage = createStorage({
    driver: cloudflareKVDriver({
        binding: env.KV,
    })
})

const config: NextAuthConfig = {
    theme: {logo: "https://authjs.dev/img/logo-sm.png"},
    adapter: UnstorageAdapter(storage),
    cookies: {
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
    },
    providers: [
        GitHub,
        {
            id: "linux-do",
            name: "Linux Do",
            type: "oauth",
            authorization: 'https://connect.linux.do/oauth2/authorize',
            token: "https://connect.linux.do/oauth2/token",
            userinfo: "https://connect.linux.do/api/user",
            checks: ['none'],
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                }
            },
            style: {
                logo: "/linux-do.png"
            }
        }
    ],
    basePath: "/auth",
    callbacks: {
        authorized({request, auth}) {
            const {pathname} = request.nextUrl
            if (pathname === "/middleware-example") return !!auth
            return true
        },
        jwt({token, trigger, session, account}) {
            if (trigger === "update") token.name = session.user.name
            if (account?.provider === "keycloak") {
                return {...token, accessToken: account.access_token}
            }
            return token
        },
        async session({session, token}) {
            if (token?.accessToken) {
                session.accessToken = token.accessToken
            }
            return session
        },
    },
    debug: isDev,
}

export const {handlers, auth, signIn, signOut} = NextAuth(config)

declare module "next-auth" {
    interface Session {
        accessToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
    }
}
