
import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
// import Player from '../../../classes/aframe/player'

export default class LocalScene extends React.Component {
  componentDidMount() {
    // const player = new Player()
    // player.setupAvatar()
  }

  render() {
    return (
      <Entity
        id="player"
        camera
        position="0 1.6 0"
        spawn-in-circle="radius:3"
        wasd-controls look-controls="reverseMouseDrag: true"
      />
    )
  }
}
