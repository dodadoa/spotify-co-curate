import { useEffect, useState, useCallback } from 'react'
import { getSession } from "next-auth/react";
import { isAuthenticated } from "../utils/isAuthenticated";
import { tables } from '../external/airtable'

export default function Home({ hello }) {

  const [player, setPlayer] = useState(null)
  const [changing, setChanging] = useState(0)
  const [isPaused, setPaused] = useState(false);
  const [isActive, setActive] = useState(false);
  const [activeSession, setActiveSession] = useState({})

  const track = {
    name: "",
    album: {
      images: [
        { url: "" }
      ]
    },
    artists: [
      { name: "" }
    ]
  }
  const [currentTrack, setTrack] = useState(track);

  const fetchSession = async () => {
    const session = await getSession()
    setActiveSession(session)
    const accessToken = session.user.accessToken

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
        name: 'Imagining 1',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state => {

        if (!state) {
          return;
        }
  
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
  
        player.getCurrentState().then(state => {
          (!state) ? setActive(false) : setActive(true)
        });
  
      }));

      player.connect();
    };
  }

  const fetchTablesAndRandomOneSong = async () => {
    try {
      const result = await tables()
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  const refresh = async () => {
    await fetchTablesAndRandomOneSong()
    setTimeout(refresh, 5000)
  }

  useEffect(() => {
    fetchSession()
  }, [])

  useEffect(() => {
    setTimeout(refresh, 5000);
  }, [])

  const handleNext = () => {}

  return (
    <div>
      {hello}
      <button onClick={() => {
        player.togglePlay()
        player.activateElement()
      }}> PLAY </button>
      <button onClick={handleNext}> NEXT </button>
      <p>{JSON.stringify(currentTrack)}</p>
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

  return { props: { hello: 'hello' } };
};