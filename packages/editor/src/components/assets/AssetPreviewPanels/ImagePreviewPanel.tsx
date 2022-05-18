import React from 'react'
import styled from 'styled-components'

/**
 * @author Abhishek Pathak
 */
const ImagePreview = styled.img`
  display: block;
  margin-left: auto;
  margin-right: auto;
`

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 * @param props
 */

export const ImagePreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  return <ImagePreview src={url} />
}
