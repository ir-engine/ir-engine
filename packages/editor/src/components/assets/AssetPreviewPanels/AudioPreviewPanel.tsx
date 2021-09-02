import React from 'react'

export const AudioPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return (
    <audio src={url} controls={true}>
      Your browser doesn't support Audio
    </audio>
  )
}
