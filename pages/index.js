import { useEffect, useState, useCallback, useRef } from 'react'
import { getSession } from "next-auth/react"
import { isAuthenticated } from "../utils/isAuthenticated"
import { tables, getRecord } from '../external/airtable'
import style from "../styles/index.module.css";
import { addSongToQueue } from '../external/spotify'
import { randomCountableNumber } from '../utils/random'

//                    1s  * 60 = minute
//                          1m * 4 = 4 minute
const THREE_MINUTES = 1000 * 60 * 3

export default function Home({ hello }) {

  const [player, setPlayer] = useState(null)
  const [changing, setChanging] = useState(0)
  const [isPaused, setPaused] = useState(false)
  const [isActive, setActive] = useState(false)
  const [activeSession, setActiveSession] = useState({})
  const [recordSongDetail, setRecordSongDetail] = useState({ fields: { caption: '', user: '' }})

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

        getRecord(state.track_window.current_track.id)
          .then((result) => {
            setRecordSongDetail(result)
          })
          .catch((err) => {
            console.log(err)
          })

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
        console.log('Error, no Records')
        return
      }
      const recordsLength = records.length
      const randomNum = randomCountableNumber(recordsLength)
      const pickedRecord = records[randomNum]
      console.log(pickedRecord)

      if (!activeSession && !activeSession.user && !activeSession.user.accessToken) {
        console.log('Error, no active session')
        return
      }

      const result = await addSongToQueue(activeSession.user.accessToken, pickedRecord.fields.songId)
      console.log('Added song to queue!', result)

    } catch (error) {
      console.log(error)
    }
  }

  const refresh = async () => {
    await fetchTablesAndRandomOneSong()
    setTimeout(refresh, THREE_MINUTES)
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
        <div className={style.textDescription}>
          <p>Song Name: {currentTrack.name}</p>
          <p>Artist: {currentTrack.artists.map((artist) => `${artist.name} `)}</p>
          {recordSongDetail && <p>Suggested by: {recordSongDetail.fields.user}</p>}
        </div>
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