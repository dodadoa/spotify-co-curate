
import { signIn } from "next-auth/react";

export default function Login() {
  const handleLogin = () => {
    signIn('spotify', { callbackUrl: 'http://localhost:3000' })
  }

  return (
    <div>
     <button onClick={handleLogin}> LOGIN </button>
    </div>
  )
}