import {useRef, useEffect, useCallback} from 'react'
import {GenerateIcon} from '@sanity/icons'
import {useSecrets} from '@sanity/studio-secrets'
import {Button, Card, Flex, Grid, Spinner, Text} from '@sanity/ui'
import {useEffect} from 'react'
import {MemberField, set, useFormValue} from 'sanity'
import {namespace} from '../../constants'
import {setPluginConfig} from '../../helpers'
import {useAnimatedThumbs} from './hooks'

export function input(props) {
  const {
    value,
    members,
    renderField,
    renderInput,
    renderItem,
    onChange,
    renderPreview,
    renderDefault,
  } = props

  const {secrets, loading} = useSecrets(namespace)

  useEffect(() => {
    if (!secrets?.apiKey && !loading) {
      console.error('Vimeo access token is not set. Please set it in the Studio Secrets.')
    } else if (secrets?.apiKey) {
      setPluginConfig({
        accessToken: secrets.apiKey,
      })
    }
  }, [secrets, loading])

  const videoUri = useFormValue(['uri'])
  const thumbnails = useFormValue(['animatedThumbnails'])
  const srcset = useFormValue(['srcset'])
  const preview = srcset.find((item) => item.rendition === '540p')

  const {status, generateCoverLoop} = useAnimatedThumbs(videoUri, thumbnails)

  const startTimeMember = members.find(
    (member) => member.kind === 'field' && member.name === 'startTime',
  )
  const durationMember = members.find(
    (member) => member.kind === 'field' && member.name === 'duration',
  )

  useEffect(() => {
    if (items?.length) {
      // set startTime and duration as the first item's values
      const firstItem = items[0]
      if (!firstItem?.sizes?.length) return

      onChange(set(firstItem.sizes[0].start_time, ['startTime']))
      onChange(set(firstItem.sizes[0].duration, ['duration']))
    }
  }, [items])

  const handleGenerate = async () => {
    onChange([set([], ['thumbnails'])])
    const start = startTimeMember.field.value
    const duration = durationMember.field.value
    const generatedItems = await generateCoverLoop(start, start + duration)
    console.log('generated items', generatedItems)
    // const itemsWithKeys = generatedItems.map((item) => {
    //   const sizesWithKey = item.sizes.map((size) => ({...size, _key: `size-${size.width}`}))
    //   return {...item, sizes: sizesWithKey, _key: `thumb-${item.clip_uri}`}
    // })

    // const duration = itemsWithKeys[0]?.sizes[0]?.duration
    // const startTime = itemsWithKeys[0]?.sizes[0]?.startTime
    // onChange([
    //   set(itemsWithKeys, ['thumbnails']),
    //   set(duration, ['duration']),
    //   set(startTime, ['startTime']),
    // ])
  }

  const renderButton = () => {
    switch (status.type) {
      case 'loading':
      case 'loading-delete':
        return (
          <Card tone="neutral" padding={3}>
            <Flex align={'center'} gap={3}>
              <Spinner />
              <Text size={1} weight="medium">
                Processing...
              </Text>
            </Flex>
          </Card>
        )
      case 'success':
      default:
        const isInvalid =
          startTimeMember?.field?.validation?.length > 0 ||
          durationMember?.field?.validation?.length > 0

        return (
          <Button
            icon={GenerateIcon}
            text="Update Vimeo Thumbnail"
            onClick={handleGenerate}
            disabled={status.type === 'loading' || status.type === 'error' || isInvalid}
          />
        )
    }
  }

  const renderVideo = () => {
    const videoRef = useRef(null)
    useEffect(() => {
      const start = startTimeMember.field.value
      const end = durationMember.field.value + startTimeMember.field.value
      const video = document.querySelector('video')
      if (videoRef.current) {
        if (start + end > 0) {
          videoRef.current.currentTime = start
          videoRef.current.play()
        } else {
          videoRef.current.currentTime = 0
          videoRef.current.pause()
        }
      } else {
        console.log('no video ref')
      }
    }, [startTimeMember.field.value, durationMember.field.value, videoRef])

    const handleTimeUpdate = useCallback(
      (e) => {
        const start = startTimeMember.field.value
        const end = durationMember.field.value + start
        if (videoRef.current.currentTime > end) {
          videoRef.current.currentTime = start
        }
      },
      [startTimeMember, durationMember],
    )

    return (
      <video
        ref={videoRef}
        src={preview.link}
        muted
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '50vh',
          aspectRatio: preview.width / preview.height,
        }}
        onTimeUpdate={handleTimeUpdate}
      />
    )
  }

  return (
    <>
      <Card>
        <Flex>{renderVideo()}</Flex>
        <Grid columns={2} gap={3} paddingBottom={3}>
          {startTimeMember && (
            <MemberField
              member={startTimeMember}
              renderInput={renderInput}
              renderField={renderField}
              renderItem={renderItem}
            />
          )}
          {durationMember && (
            <MemberField
              member={durationMember}
              renderInput={renderInput}
              renderField={renderField}
              renderItem={renderItem}
            />
          )}
        </Grid>
        <Flex align={'center'} wrap gap={3} paddingBottom={3}>
          {renderButton()}
        </Flex>

        {status.message && (
          <Card
            padding={3}
            tone={
              status.type === 'error'
                ? 'critical'
                : status.type === 'already-generated'
                  ? 'caution'
                  : status.type === 'success'
                    ? 'positive'
                    : 'neutral'
            }
          >
            <Text size={1}>{status.message}</Text>
          </Card>
        )}
      </Card>

      <Card marginTop={3}>
        {members.map((member) => {
          return (
            member.kind === 'field' &&
            !['startTime', 'duration'].includes(member.name) && (
              <MemberField
                key={member.name}
                member={member}
                renderInput={renderInput}
                renderField={renderField}
                renderItem={renderItem}
                renderPreview={renderPreview}
              />
            )
          )
        })}
      </Card>
    </>
  )
}
