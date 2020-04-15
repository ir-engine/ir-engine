
import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

function PlayerComp(props: any) {
  const playerProps = 'fuseCursor: ' + props.fuseCursor
  return (
    <Entity
      player={ playerProps }
    />
  )
}

export default PlayerComp
