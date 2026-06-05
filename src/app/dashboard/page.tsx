import { redirect } from 'next/navigation'

// /dashboard leitet nach PROJ-3 auf /projects weiter.
// Die eigentliche geschützte App-Landingpage ist nun /projects.
export default function DashboardPage() {
  redirect('/projects')
}
