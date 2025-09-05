import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect alla pagina statica del blog
  redirect('/index.html');
}
