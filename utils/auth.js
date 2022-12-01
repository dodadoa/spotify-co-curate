import axios from 'axios'

export const refreshAccessToken = async (token) => {
    try {
  
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
      const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET
      console.log(clientId)
      const encoded = btoa(clientId + ':' + clientSecret)
      const response = await axios({
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        data: `grant_type=refresh_token&refresh_token=${token.refreshToken}`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${encoded}`
        },
        auth: {
          username: clientId,
          password: clientSecret
        },
      })
  
      const refreshedTokens = response.data
  
      if (response.status != 200) {
        throw refreshedTokens
      }
  
      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      }
    } catch (error) {
      console.log(error)
  
      return {
        ...token,
        error: "RefreshAccessTokenError",
      }
    }
  }
