import {useState} from 'react'
import {ps} from './messages'
import {setThumbnail} from './utils'

export const useAnimatedThumbs = (uri, field) => {
  const hasThumbnails = field?.thumbnails?.length && field?.thumbnails?.[0]?.status === 'completed'
  const [status, setStatus] = useState(
    hasThumbnails ? {type: 'already-generated'} : {type: 'idle', message: undefined},
  )
  const [attempt, setAttempt] = useState(0)
  const generateCoverLoop = async (start, end) => {
    setAttempt(0)
    setStatus({type: 'loading', message: 'Generating thumbnail...'})

    try {
      if (!uri) {
        throw new Error('No video URI provided')
      }

      const thumbnail = await setThumbnail(uri, start)

      setStatus({type: 'success', message: `Thumbnail successfully generated`})

      return thumbnail
    } catch (e) {
      console.error('Error generating cover', e)
      setStatus({type: 'error', message: e.message})
      return
    }
  }
  return {status, attempt, generateCoverLoop}
}
