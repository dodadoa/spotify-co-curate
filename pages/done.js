import React, { useEffect } from "react";
import style from "../styles/done.module.css";
import { useRouter } from "next/router";

const Done = () => {
  const router = useRouter();

  useEffect(() => {
    let timeOut = setTimeout(() => {
      router.push("/form");
    }, 5000);

    return () => (timeOut ? clearTimeout(timeOut) : null);
  }, []);

  return (
    <div className={style.done}>
      <div className={style.doneContainer}>
        <picture>
          <img className={style.doneIcon} src="/done.svg" alt="done" />
        </picture>
      </div>
      <h2>
        Submitted <br /> Thanks for sharing{" "}
      </h2>
    </div>
  );
};

export default Done;
