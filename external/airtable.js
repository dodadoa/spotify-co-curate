import axios from 'axios'

const config = {
  headers: {
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
  }
}

export const tables = async () => {
  return await axios.get(
    "https://api.airtable.com/v0/appqFEOQnCcbDegfP/Table%201",
    config
  )
}
