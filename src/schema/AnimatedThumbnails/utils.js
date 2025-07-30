import {getPluginConfig} from '../../helpers'

// You can find more info here:
// https://developer.vimeo.com/api/reference/videos/3.4.8#create_animated_thumbset
// Please note that you can't create more than four sets of animated thumbnails for the same video.
// check if the video has already animated thumbnails

export const getVideoVersions = async (uri) => {
  //return all versions
  const pluginConfig = getPluginConfig()
  const vimeoAccessToken = pluginConfig?.accessToken
  const versions = await fetch(`https://api.vimeo.com${uri}/versions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${vimeoAccessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return await versions.json()
}

export const updateVersion = async (uri, desc = '', current = true) => {
  //uri is from a returned version object
  const pluginConfig = getPluginConfig()
  const vimeoAccessToken = pluginConfig?.accessToken
  const res = await fetch(`https://api.vimeo.com${uri}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${vimeoAccessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: desc,
      is_current: current,
    }),
  })

  return await res.json()
}

export const setThumbnail = async (uri, time = 0) => {
  const pluginConfig = getPluginConfig()
  const vimeoAccessToken = pluginConfig?.accessToken
  const res = await fetch(`https://api.vimeo.com${uri}/pictures`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vimeoAccessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      active: true,
      time: time,
    }),
  })
}

export const startTrim = async (uri, start, end) => {
  const pluginConfig = getPluginConfig()
  const vimeoAccessToken = pluginConfig?.accessToken

  const res = await fetch(`https://api.vimeo.com${uri}/trim`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vimeoAccessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      trim_start: start,
      trim_end: end,
    }),
  })

  const data = await res.json()
  console.log('data', data)
  if (data.status === 'OK') {
    //Trim operation started, start polling for status
    return data
  } else {
    throw new Error(`Error creating cover loop: ${JSON.stringify(data)}`)
  }
}
