import SpotifyWebApi from 'spotify-web-api-js'

export const addSongToQueue = async (accessToken, songId) => {
  const uri = `spotify:track:${songId}`
  const spotifyApi = new SpotifyWebApi()
  spotifyApi.setAccessToken(accessToken)
  const result = await spotifyApi.queue(uri)
  return result
}
