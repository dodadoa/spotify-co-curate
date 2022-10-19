import { useEffect } from 'react'
import { getSession } from "next-auth/react";
import { isAuthenticated } from "../utils/isAuthenticated";

export default function Home({ hello }) {

  const fetchSession = async () => {
    const session = await getSession()
    console.log(session)
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return (
    <div>
      {hello}
      <div>AUTHEN</div>
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!(await isAuthenticated(session))) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: { hello: 'hello' } };
};