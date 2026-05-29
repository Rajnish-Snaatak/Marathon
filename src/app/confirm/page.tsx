import { redirect } from 'next/navigation'

// Confirm action consolidated into /status
export default function ConfirmPage() {
  redirect('/status')
}
