import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

export default class Floor extends React.Component {
  render() {
    return (
      <Entity
        primitive="a-plane"
        src="#groundTexture"
        rotation="-90 0 0"
        height="100"
        width="100"
      />
    )
  }
}
