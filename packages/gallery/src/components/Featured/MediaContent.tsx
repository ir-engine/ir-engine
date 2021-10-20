import React from 'react'
import CardMedia from '@material-ui/core/CardMedia'
import styles from './Featured.module.scss'
import { getComponentTypeForMedia } from '../Feed'

export const MediaContent = ({ item, history, className, addToRefs, full }) => {
  switch (getComponentTypeForMedia(item.previewType || 'image')) {
    case 'img':
      return (
        <CardMedia
          component="img"
          className={className}
          image={item.previewUrl}
          loading="lazy"
          onClick={() => {
            history.push('/post?postId=' + item.id)
          }}
        />
      )
      break
    case 'video':
      const dataSrc = { [full ? 'src' : 'data-src']: item.previewUrl }
      const options = full
        ? {
            controls: true
          }
        : {
            loop: true,
            autoPlay: true,
            muted: true,
            playsInline: true
          }
      return (
        <CardMedia
          component="video"
          ref={addToRefs}
          className={`${className} lazy`}
          {...dataSrc}
          {...options}
          onClick={() => {
            history.push('/post?postId=' + item.id)
          }}
        />
      )
      break

    default:
      break
  }
}
