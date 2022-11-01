import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createRecord, tables } from '../external/airtable'
import { getSession } from "next-auth/react";
import { fetchAlbum } from '../external/spotify'

const Form = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    try {
      const fields = {
        caption: data.caption,
        source: 'spotify',
        target: 'any',
        user: data.name
      }
      const result = await createRecord({ fields })
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  const search = async (text) => {
    try {
      const session = await getSession()
      const accessToken = session.user.accessToken
      const result = await fetchAlbum(accessToken)
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input onChange={(e) => search(e.target.value)} />

        <input  {...register("caption", { required: true })} />
        {errors.caption && <span>This field is required</span>}

        <input {...register("name", { required: true })} />
        {errors.name && <span>This field is required</span>}

        <input type="submit" />
      </div>
    </form>
  );
}

export default Form