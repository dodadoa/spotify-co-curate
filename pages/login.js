import { signIn } from "next-auth/react"
import style from "../styles/login.module.css"

export default function Login() {
  const handleLogin = () => {
    signIn('spotify', { callbackUrl: 'http://localhost:3000' }, { prompt: "login" })
  }

  return (
    <div className={style.loginWrapper}>
     <button className={style.loginButton} onClick={handleLogin}> LOGIN </button>
    </div>
  )
}