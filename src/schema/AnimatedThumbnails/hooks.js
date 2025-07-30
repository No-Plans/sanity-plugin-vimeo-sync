import {useState} from 'react'
import {ps} from './messages'
import {startTrim, setThumbnail, getVideoVersions, updateVersion} from './utils'

export const useAnimatedThumbs = (uri, field) => {
  const hasThumbnails = field?.thumbnails?.length && field?.thumbnails?.[0]?.status === 'completed'
  const [status, setStatus] = useState(
    hasThumbnails ? {type: 'already-generated'} : {type: 'idle', message: undefined},
  )
  const [attempt, setAttempt] = useState(0)
  const generateCoverLoop = async (start, end) => {
    setAttempt(0)
    // setStatus({type: 'loading', message: 'Beginning trim operation...'})

    try {
      if (!uri) {
        throw new Error('No video URI provided')
      }

      //get all current versions
      // const versions = await getVideoVersions(uri)
      // const current = versions.data.find((version) => version.active)
      // const existingCovers = versions.data.filter((version) => version.description === 'cover-loop')
      // const count = versions.total

      //start trim operation
      // try {
      //   await startTrim(uri, start, end)
      // } catch (e) {
      //   throw new Error(e.message)
      // }
      const thumbnail = await setThumbnail(uri, start)
      setStatus({type: 'success', message: 'Thumbnail updated'})

      //begin polling for updated versions
      // const loadedVersions = await new Promise((resolve) => {
      //   setStatus({type: 'loading', message: 'Video trimming... do not close this window'})
      //   const interval = setInterval(async () => {
      //     const updatedVersions = await getVideoVersions(uri)
      //     const newCount = updatedVersions.total
      //     if (newCount > count) {
      //       //when new version is added, revert current version to original
      //       setStatus({
      //         type: 'loading',
      //         message: `Video saving... do not close this window`,
      //       })

      //       if (updatedVersions.data[0].active) {
      //         //after trim video has been saved, revert thumbnail
      //         setStatus({
      //           type: 'loading',
      //           message: `Video transcoding, almost done... do not close this window`,
      //         })

      //         if (updatedVersions.data[0].transcode?.status === 'complete') {
      //           clearInterval(interval)
      //           setStatus({
      //             type: 'loading',
      //             message: `Finishing up...`,
      //           })
      //           const setCurrent = await updateVersion(current.uri, '', true)
      //           const setDescription = await updateVersion(
      //             updatedVersions.data[0].uri,
      //             'cover-loop',
      //             false,
      //           )
      //           setStatus({type: 'success', message: 'successfully generated cover loop'})
      //           resolve(updatedVersions)
      //         }
      //       }
      //     }
      //   }, 1000)
      // })

      return thumbnail
    } catch (e) {
      console.error('Error generating cover', e)
      setStatus({type: 'error', message: e.message})
      return
    }
  }
  return {status, attempt, generateCoverLoop}
}
