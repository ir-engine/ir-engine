import React from 'react'
import styled from 'styled-components'

/**
 * @author Abhishek Pathak
 */
const VedioPreview = styled.video`
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 500px;
`

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 * @param props
 * @returns
 */

export const VedioPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return (
    <VedioPreview src={url} controls={true}>
      Your Browser doesn't support Video
    </VedioPreview>
  )
}
