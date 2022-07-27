import React from 'react'
import styled from 'styled-components'

const ImagePreview = styled.img`
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-height: 100%;
`

/**
 * @param props
 */

export const ImagePreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  return <ImagePreview src={url} alt="Photo" />
}
