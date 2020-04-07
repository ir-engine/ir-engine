import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

export default class Skybox extends React.Component {
  render() {
    return (
      <Entity
        primitive="a-sky"
        height="2048"
        radius="30"
        src="#skyTexture"
        theta-length="90"
        width="2048"
      />
    )
  }
}
