import { useEffect, useState, useCallback, useRef } from 'react'
import { getSession } from "next-auth/react"
import { isAuthenticated } from "../utils/isAuthenticated"
import { tables } from '../external/airtable'
import style from "../styles/index.module.css";

//                    1s  * 60 = minute
//                          1m * 4 = 4 minute
const FOUR_MINUTES = 1000 * 60 * 4

export default function Home({ hello }) {

  const [player, setPlayer] = useState(null)
  const [changing, setChanging] = useState(0)
  const [isPaused, setPaused] = useState(false)
  const [isActive, setActive] = useState(false)
  const [activeSession, setActiveSession] = useState({})
  const [randomRecord, setRandomRecord] = useState({ fields: { caption: '', user: '' }})

  const videoRef = useRef();

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
  const [currentTrack, setTrack] = useState(track)

  const fetchSession = async () => {
    const session = await getSession()
    setActiveSession(session)
    const accessToken = session.user.accessToken

    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
        name: 'Imagining 1',
        getOAuthToken: cb => { cb(accessToken) },
        volume: 0.5
      })

      setPlayer(player)

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id)
      })

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id)
      })

      player.addListener('player_state_changed', (state => {

        if (!state) {
          return
        }
  
        setTrack(state.track_window.current_track)
        setPaused(state.paused)
  
        player.getCurrentState().then(state => {
          (!state) ? setActive(false) : setActive(true)
        })
  
      }))

      player.connect()
    }
  }

  const fetchTablesAndRandomOneSong = async () => {
    try {
      const tableData = await tables()
      const { records } = tableData.data
      if (!records) {
        console.log('Error')
        return
      }
      const recordsLength = records.length
      const randomNum = Math.floor(Math.random() * recordsLength)
      const pickedRecord = records[randomNum]
      console.log(pickedRecord)

      setRandomRecord(pickedRecord)
    } catch (error) {
      console.log(error)
    }
  }

  const refresh = async () => {
    await fetchTablesAndRandomOneSong()
    setTimeout(refresh, FOUR_MINUTES)
  }

  useEffect(() => {
    fetchSession()
  }, [])

  useEffect(() => {
    setTimeout(refresh, 100)
  }, [])

  useEffect(() => {
    setTimeout(()=>{
      videoRef.current.play()
    },1000)
  }, [])

  return (
    <div className={style.main}>
      <video loop ref={videoRef} muted className={style.video}>
        <source src="/glitch_bg_1.mp4" type="video/mp4"/>
      </video>

      <div className={style.textDescriptionBox}>
        <p className={style.textDescription}>Song Name: {currentTrack.name}</p>
        <p className={style.textDescription}>Artist: {currentTrack.artists.map((artist) => `${artist.name} `)}</p>
        <p className={style.textDescription}>Caption: {randomRecord.fields.caption}</p>
        <p className={style.textDescription}>Name: {randomRecord.fields.user}</p>
      </div>
      {/* <button onClick={() => {
        player.togglePlay()
        player.activateElement()
      }}> PLAY </button>
      <button onClick={handleNext}> NEXT </button> */}
    </div>
  )
}

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