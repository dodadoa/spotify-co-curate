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
    <div className="form-wrapper">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <h1>Join Our Playlist</h1>
          <input placeholder="Search for songs" onChange={(e) => search(e.target.value)} />

          <textarea placeholder="Input caption about the song ..." {...register("caption", { required: true })} />
          {errors.caption && <span>This field is required</span>}

          <input placeholder="Input your name" {...register("name", { required: true })} />
          {errors.name && <span>This field is required</span>}

          <input type="submit" />
        </div>
      </form>
    </div>
  );
};

export default Form;
