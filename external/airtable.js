import axios from 'axios'

const config = {
  headers: {
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
  }
}

export const tables = async () => {
  const page1 = await axios.get(
    "https://api.airtable.com/v0/appqFEOQnCcbDegfP/Table%201",
    config
  )

  const offset = page1.data.offset

  const page2 = await axios.get(
    `https://api.airtable.com/v0/appqFEOQnCcbDegfP/Table%201?offset=${offset}`,
    config
  )

  const fullRecords = [...page1.data.records , ...page2.data.records]
  return fullRecords
}

export const getRecord = async (songId) => {
  try {
    const fullRecords = await tables()

    if (fullRecords.length === 0) {
      console.log('not found table')
      throw new Error('data not found')
    }

    console.log('table', fullRecords)

    const record = fullRecords.find((record) => record.fields.songId === songId)
    if (!record) {
      console.log('not found in record')
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
