import Link from 'next/link'

import { LoginForm } from '@/components/auth/login-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Anmelden</CardTitle>
          <CardDescription>
            Melde dich mit E-Mail und Passwort an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <span>
            Noch kein Konto?{' '}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
              Registrieren
            </Link>
          </span>
        </CardFooter>
      </Card>
    </main>
  )
}
