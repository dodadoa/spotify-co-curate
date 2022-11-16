import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { createRecord, tables } from "../external/airtable";
import { getSession } from "next-auth/react";
import { fetchAlbum } from "../external/spotify";
import { isAuthenticated } from "../utils/isAuthenticated";
import style from "../styles/form.module.css";

const Form = () => {
  const [searchResultDiv, setSearchResultDiv] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [disabledSubmit, setDisabledSubmit] = useState(true);
  const watchingForm = watch();

  useEffect(() => {
    if (!!watchingForm.caption && !!watchingForm.name) {
      setDisabledSubmit(false);
    } else {
      setDisabledSubmit(true);
    }
  }, [watchingForm]);

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
    if (text.length > 0) {
      try {
        const session = await getSession();
        const accessToken = session.user.accessToken;
        const result = await fetchAlbum(accessToken);
        console.log(result);

        const response = await fetch(
          `https://api.spotify.com/v1/search?type=track&q=${text}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const jsonResponse = await response.json();
          console.log(jsonResponse);
          if (!jsonResponse.tracks) {
            return [];
          }
          setSearchResultDiv(true);
          const track = jsonResponse.tracks.items.map((track) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri,
          }));
          setSearchResults(track);
          console.log(track);
          return track;
        } else {
          throw new Error("search request failed");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setSearchResults([]);
      setSearchResultDiv(false);
    }
  };

  return (
    <div className={style.form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={style.formBody}>
          <h1 className={style.header}> Join Our Playlist </h1>
          <span className={style.inputWrapper}>
            {searchResultDiv ? (
              <div className={style.searchResult}>
                {searchResults.map((track) => {
                  return (
                    <div key={track.id} className={style.track}>
                      <p>{track.name}</p>
                      <br />
                      <p>
                        {track.artist} | {track.album}{" "}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <></>
            )}
            <div className={style.searchInput}>
              <input
                className={style.input}
                onChange={(e) => search(e.target.value)}
                placeholder="Search for songs"
              />
              <div className={style.searchIcon}>
                <Image width={20} height={20} src="/magnify.svg" alt="search" />
              </div>
            </div>
          </span>
          <textarea
            className={style.textarea}
            {...register("caption", { required: true })}
            placeholder="Write caption about the song ..."
          />
          <p>{errors.caption && <span>This field is required!</span>}</p>
          <input
            className={style.input}
            {...register("name", { required: true })}
            placeholder="Name ..."
          />
          <p>{errors.name && <span>This field is required!</span>}</p>
        </div>
        <input
          className={disabledSubmit ? style.submitDisabled : style.submitActive}
          type="submit"
          value="submit"
          disabled={disabledSubmit}
        />
      </form>
    </div>
  );
};

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

  return { props: { hello: "hello" } };
};

export default Form;
