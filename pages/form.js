import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { createRecord, tables } from "../external/airtable";
import { getSession } from "next-auth/react";
import { fetchAlbum } from "../external/spotify";
import { isAuthenticated } from "../utils/isAuthenticated";
import style from "../styles/form.module.css";

const Form = () => {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState({})

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [disabledSubmit, setDisabledSubmit] = useState(true);
  const watchingForm = watch();

  useEffect(() => {
    if (!!watchingForm.caption && !!watchingForm.name && !!selectedTrack) {
      setDisabledSubmit(false);
    } else {
      setDisabledSubmit(true);
    }
  }, [watchingForm, selectedTrack]);

  const onSubmit = async (data) => {
    if (!selectedTrack && !selectedTrack.id) {
      console.log("Error not has track")
      return
    }

    try {
      const fields = {
        caption: data.caption,
        source: "spotify",
        target: "any",
        user: data.name,
        songId: selectedTrack.id
      };
      const result = await createRecord({ fields });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const search = async (text) => {
    setSearchValue(text)
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
          setShowSearchResults(true);
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
      setShowSearchResults(false);
    }
  };

  return (
    <div className={style.form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={style.formBody}>
          <h1 className={style.header}> Join Our Playlist </h1>
          <span className={style.inputWrapper}>
            {showSearchResults ? (
              <div className={style.searchResult}>
                {searchResults.map((track) => {
                  return (
                    <div key={track.id} className={style.track} onClick={(e) => {
                        e.preventDefault()
                        setSelectedTrack(track)
                        setSearchValue("")
                        setShowSearchResults(false)
                      }}>
                      <p><b>{track.name}</b></p>
                      <p>{track.artist} | {track.album}{" "}</p>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className={style.searchInput}>
              <input
                className={style.input}
                onChange={(e) => search(e.target.value)}
                onFocus={(e) => search(e.target.value)}
                placeholder="Search for songs"
                value={searchValue}
              />
              <div className={style.searchIcon}>
                <Image width={20} height={20} src="/magnify.svg" alt="search" />
              </div>
            </div>
          </span>
          <div>
            <p>{selectedTrack.name}</p>
          </div>
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
