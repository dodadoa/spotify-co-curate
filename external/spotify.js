import SpotifyWebApi from 'spotify-web-api-js'

export const addSongToQueue = async (accessToken, songId) => {
  try {
    const uri = `spotify:track:${songId}`
    const spotifyApi = new SpotifyWebApi()
    spotifyApi.setAccessToken(accessToken)
    const result = await spotifyApi.queue(uri)
    return result
  } catch (error) {
    console.error('Error, addSongToQueue', error)
    throw error
  }
}

export const pausePlayer = async (accessToken) => {
  try {
    const spotifyApi = new SpotifyWebApi()
    spotifyApi.setAccessToken(accessToken)
    const result = await spotifyApi.pause()
    return result
  } catch (error) {
    console.error('Error, pausePlayer', error)
    throw error
  }
}

export const resumePlayer = async (accessToken) => {
  try {
    const spotifyApi = new SpotifyWebApi()
    spotifyApi.setAccessToken(accessToken)
    const result = await spotifyApi.play()
    return result
  } catch (error) {
    console.error('Error, resumePlayer', error)
    throw error
  }
}

export const nextSong = async (accessToken) => {
  try {
    const spotifyApi = new SpotifyWebApi()
    spotifyApi.setAccessToken(accessToken)
    const result = await spotifyApi.skipToNext()
    return result
  } catch (error) {
    console.error('Error, pausePlayer', error)
    throw error
  }
}