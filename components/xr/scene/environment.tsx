import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
import Floor from './floor'
import Lights from './lights'
import Skybox from './skybox'

export default class Environment extends React.Component {
  render() {
    return (
      <Entity>
        <Floor/>
        <Lights/>
        <Skybox/>
      </Entity>
    )
  }
}
