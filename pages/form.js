import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createRecord, tables } from "../external/airtable";
import { getSession } from "next-auth/react";
import { fetchAlbum } from "../external/spotify";
import style from "../styles/form.module.css";

const Form = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

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
          <input className={style.input} onChange={(e) => search(e.target.value)} placeholder="Search for songs" />
          <textarea className={style.textarea} {...register("caption", { required: true })} placeholder="Input caption about the song ..."  />
          <p>{errors.caption && <span>This field is required!</span>}</p>
          <input className={style.input} {...register("name", { required: true })} placeholder="Input your name" />
          <p>{errors.name && <span>This field is required!</span>}</p>
          
        </div>
        <input className={style.submit} type="submit" value="submit"/>
      </form>
    </div>
  );
};

export default Form;
