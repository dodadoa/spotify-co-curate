import { useEffect } from "react";
import { signOut } from "next-auth/react"
import style from "../styles/login.module.css"
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter()
  const handleLogout = async () => {
    await signOut('spotify', { callbackUrl: 'http://localhost:3000' })
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  return (
    <div className={style.loginWrapper}>
     <button className={style.loginButton} onClick={handleLogout}> Logout </button>
    </div>
  )
}

export const getServerSideProps = async (ctx) => {
  return { props: { hello: "hello" } };
};

