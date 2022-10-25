import React, { useEffect } from 'react'
import { createRecord } from '../external/airtable'
import { useForm } from 'react-hook-form'


const Form = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
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