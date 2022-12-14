import { useEffect, useState, useCallback, useRef } from "react";
import { getSession } from "next-auth/react";
import { isAuthenticated } from "../utils/isAuthenticated";
import { tables, getRecord } from "../external/airtable";
import style from "../styles/index.module.css";
import { addSongToQueue, resumePlayer, pausePlayer, nextSong } from "../external/spotify";
import { randomCountableNumber } from "../utils/random";
import { refreshAccessToken } from '../utils/auth'

const N_MINUTES = 1000 * 60 * (process.env.NEXT_PUBLIC_NUMBER_MINUTES | 1);

export default function Home({ hello }) {
  const [recordSongDetail, setRecordSongDetail] = useState({
    fields: { caption: "", user: "" },
  });
  const [trackImage, setTrackImage] = useState("");
  const [trackQR, setTrackQR] = useState("");

  const videoRef = useRef();
  const localSongAudioRef = useRef();

  const track = {
    name: "",
    album: {
      images: [{ url: "" }],
    },
    artists: [{ name: "" }],
  };
  const [currentTrack, setTrack] = useState(track);

  const fetchSession = async () => {
    const session = await getSession();

    const accessToken = session.user.accessToken;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Imagining 1",
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        console.log('track id', state.track_window.current_track.id)

        getRecord(state.track_window.current_track.id)
          .then((result) => {
            setTrack(state.track_window.current_track);
            setTrackImage(state.track_window.current_track.album.images[2].url);
            setTrackQR(state.track_window.current_track.uri);
            setRecordSongDetail(result);
          })
          .catch((err) => {
            console.log(err);
          });
      });

      player.connect();
    };
  };

  const fetchTablesAndRandomOneSong = async () => {
    try {
      const fullRecords = await tables();
      if (fullRecords.length === 0) {
        console.log("Error, no Records");
        return;
      }
      console.log('fullRecords', fullRecords)
      const recordsLength = fullRecords.length;
      const randomNum = randomCountableNumber(recordsLength);
      const pickedRecord = fullRecords[randomNum];

      const session = await getSession();
      let accessToken = session.user.accessToken
      if (Date.now() >= session.user.accessTokenExpires) {
         const newSessionToken = await refreshAccessToken(session.user)
         accessToken = newSessionToken.accessToken
      }

      if (pickedRecord.fields.source === "spotify") {

        const result = await addSongToQueue(
          accessToken,
          pickedRecord.fields.songId
        );
        console.log("Added song to queue!", result);
        return
      } else {
        await fetchTablesAndRandomOneSong()
      }

    } catch (error) {
      console.error("fetchTablesAndRandomOneSong", error);
    }
  };

  const refresh = async () => {
    await fetchTablesAndRandomOneSong();
    setTimeout(refresh, N_MINUTES);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    setTimeout(refresh, 100);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      videoRef.current.play();
    }, 1000);
  }, []);

  console.log(currentTrack);

  return (
    <div className={style.main}>
      <video loop ref={videoRef} muted className={style.video}>
        <source src="/glitch_bg_1.mp4" type="video/mp4" />
      </video>
      {trackQR ? (
        <div className={style.trackQrWrapper}>
          <picture>
            <img
              className={style.trackQR}
              src={`https://scannables.scdn.co/uri/plain/png/000000/white/640/${trackQR}`}
              alt="Spotify QR"
            />
          </picture>
        </div>
      ) : null}
      <div className={style.trackImgWrapper}>
        {trackImage.length > 0 ? (
          <picture>
            <img className={style.trackImg} src={trackImage} alt="trackImage" />
          </picture>
        ) : (
          <picture>
            <img className={style.trackImg} src="/done.svg" alt="trackImage" />
          </picture>
        )}
      </div>
      <div className={style.textDescriptionBox}>
        <div className={style.textDescription}>
          <p>Song Name: {currentTrack.name}</p>
          <p>
            Artist: {currentTrack.artists.map((artist) => `${artist.name} `)}
          </p>
          {recordSongDetail && (
            <p>Suggested by: {recordSongDetail.fields.user}</p>
          )}
        </div>
      </div>
      <div className={style.captionMarquee}>
        <p className={style.captionInner}>-------{recordSongDetail.fields.caption}------</p>
      </div>
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

  return { props: { hello: "hello" } };
};
