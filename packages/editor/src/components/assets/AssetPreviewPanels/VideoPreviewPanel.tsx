import React from 'react'
import styled from 'styled-components'

const VideoPreview = styled.video`
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 500px;
`

/**
 * @param props
 * @returns
 */

export const VideoPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return (
    <VideoPreview src={url} controls={true}>
      Your Browser doesn't support Video
    </VideoPreview>
  )
}
