import React from 'react'
import styled from 'styled-components'

const AudioPreview = styled.audio`
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top:300px
  max-width:500px
`

/**
 * @param props
 * @returns
 */

export const AudioPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return (
    <AudioPreview src={url} controls={true}>
      Your browser doesn't support Audio
    </AudioPreview>
  )
}
