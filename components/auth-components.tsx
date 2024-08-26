import {Button} from "./ui/button"

export async function SignIn({
                                 provider,
                                 ...props
                             }: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
    const signIn = async function() {
        "use server"
        const { signIn } = await import('auth')
        await signIn()
    }

    return (
        <form
            action={signIn}
        >
            <Button {...props}>Sign In</Button>
        </form>
    )
}

export async function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
    const signOut = async function() {
        "use server"
        const { signOut } = await import('auth')
        await signOut()
    }

    return (
        <form
            // @ts-ignore
            action={signOut}
            className="w-full"
        >
            <Button variant="ghost" className="w-full p-0" {...props}>
                Sign Out
            </Button>
        </form>
    )
}
