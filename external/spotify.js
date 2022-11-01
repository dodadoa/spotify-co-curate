import SpotifyWebApi from 'spotify-web-api-js'

export const fetchAlbum = async (accessToken) => {
  const spotifyApi = new SpotifyWebApi()
  spotifyApi.setAccessToken(accessToken)
  const result = await spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE')
  return result
}
