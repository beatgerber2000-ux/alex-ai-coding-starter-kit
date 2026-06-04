import Link from 'next/link'

import { RegisterForm } from '@/components/auth/register-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>
            Registriere dich mit E-Mail und Passwort (mind. 8 Zeichen).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <span>
            Bereits ein Konto?{' '}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Anmelden
            </Link>
          </span>
        </CardFooter>
      </Card>
    </main>
  )
}
