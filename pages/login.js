
import { signIn } from "next-auth/react";

export default function Home() {
  const handleLogin = () => {
    signIn('spotify', { callbackUrl: 'http://localhost:3000' })
  }

  return (
    <div>
     <button onClick={handleLogin}> LOGIN </button>
    </div>
  )
}