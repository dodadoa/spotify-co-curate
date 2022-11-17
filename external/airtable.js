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

export const getRecord = async (songId) => {
  try {
    const { data } = await axios.get(
      `https://api.airtable.com/v0/appqFEOQnCcbDegfP/Table%201`,
      config
    )

    if (!data) {
      throw new Error('data not found')
    }

    const record = data.records.find((record) => record.fields.songId === songId)
    if (!record) {
      throw new Error('data not found')
    }

    console.log('Records:', record)
    return record
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const createRecord = async (body) => {
  try {
    const result = axios.post(
      "https://api.airtable.com/v0/appqFEOQnCcbDegfP/Table%201",
      body,
      {
        headers: {
          ...config.headers,
          "Content-Type": "application/json"
        }
      }
    )
    return result
  } catch (error) {
    throw error
  }
}
