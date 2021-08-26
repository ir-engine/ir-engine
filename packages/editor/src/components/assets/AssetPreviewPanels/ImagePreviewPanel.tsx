import React from 'react'

type ImagePreviewProps = {
  imageUrl?: string
}

export const ImagePreviewPanel = (props) => {
  return (
    <div>
      <img src={props.resourceProps.resourceUrl} />
    </div>
  )
}
