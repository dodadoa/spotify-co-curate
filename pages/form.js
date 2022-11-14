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
          <div>
            <p>Search:</p>
            <input onChange={(e) => search(e.target.value)} />
          </div>
          <div>
            <p>Caption:</p>
            <input {...register("caption", { required: true })} />
            <p>{errors.caption && <span>This field is required!</span>}</p>
          </div>
          <div>
            <p>Name:</p>
            <input {...register("name", { required: true })} />
            <p>{errors.name && <span>This field is required!</span>}</p>
          </div>
          <input type="submit" value="submit" />
        </div>
      </form>
    </div>
  );
};

export default Form;
