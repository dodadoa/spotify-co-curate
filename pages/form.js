import React, { useEffect, useState } from "react"
import Image from 'next/image'
import { useForm } from "react-hook-form"
import { createRecord, tables } from "../external/airtable"
import { getSession } from "next-auth/react"
import { fetchAlbum } from "../external/spotify"
import { isAuthenticated } from "../utils/isAuthenticated"
import style from "../styles/form.module.css"

const Form = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [disabledSubmit, setDisabledSubmit] = useState(true)
  const watchingForm = watch()

  useEffect(() => {
    if (!!watchingForm.caption && !!watchingForm.name) {
      setDisabledSubmit(false)
    } else {
      setDisabledSubmit(true)
    }
  }, [watchingForm])

  const onSubmit = async (data) => {
    try {
      const fields = {
        caption: data.caption,
        source: "spotify",
        target: "any",
        user: data.name,
      };
      const result = await createRecord({ fields });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const search = async (text) => {
    try {
      const session = await getSession();
      const accessToken = session.user.accessToken;
      const result = await fetchAlbum(accessToken);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={style.form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={style.formBody}>
          <h1 className={style.header}> Join Our Playlist </h1>
          <span className={style.inputWrapper}>
            <input className={style.input} onChange={(e) => search(e.target.value)} placeholder="Search for songs" />
            <div className={style.searchIcon}>
              <Image width={20} height={20} src="/magnify.svg" alt="search" />
            </div>
          </span>
          <textarea className={style.textarea} {...register("caption", { required: true })} placeholder="Input caption about the song ..."  />
          <p>{errors.caption && <span>This field is required!</span>}</p>
          <input className={style.input} {...register("name", { required: true })} placeholder="Input your name" />
          <p>{errors.name && <span>This field is required!</span>}</p>
          
        </div>
        <input class={disabledSubmit ? style.submitDisabled : style.submitActive} type="submit" value="submit" disabled={disabledSubmit}/>
      </form>
    </div>
  );
};

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  if (!(await isAuthenticated(session))) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }
  }

  return { props: { hello: 'hello' } }
}

export default Form;
