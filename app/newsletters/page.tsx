import { redirect } from 'next/navigation'

// Newsletters now live on the Gallery page; old links go there.
export default function NewslettersRedirect() {
  redirect('/gallery#newsletters')
}
