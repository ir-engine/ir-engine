import React from 'react'

export const VedioPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return (
    <video src={url} controls={true}>
      Your Browser doesn't support Video
    </video>
  )
}
