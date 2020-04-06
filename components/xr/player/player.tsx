
import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
import Player from '../../../classes/aframe/player'

export default class LocalScene extends React.Component {
  componentDidMount() {
    const player = new Player()
    player.setupAvatar()
  }

  render() {
    return (
      <Entity
        id="player"
        position="0 1.6 0"
        wasd-controls="acceleration: 100" look-controls="reverseMouseDrag: false"
      >
        <Entity id="camera-rig" class="camera-rig"
          position="0 0 0">
          <Entity id="player-camera"
            class="player-camera camera"
            camera>
          </Entity>
        </Entity>
      </Entity>
    )
  }
}
