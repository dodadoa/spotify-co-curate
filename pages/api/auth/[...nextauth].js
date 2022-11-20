import axios from 'axios'
import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const scope = 'streaming user-read-playback-state user-modify-playback-state user-read-private user-read-currently-playing user-read-recently-played'


async function refreshAccessToken(token) {
  try {

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
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


export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: { scope, prompt: 'login' },
      },
    }),
  ],
  secret: process.env.NEXT_PUBLIC_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.id = account.id;
        token.expires_at = account.expires_at;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        return token;
      }
      
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout'
  },
});
