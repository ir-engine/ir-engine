import React from 'react'
import styled from 'styled-components'

/**
 * @author Abhishek Pathak
 */
const AudioPreview = styled.audio`
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top:300px
  max-width:500px
`

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
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
