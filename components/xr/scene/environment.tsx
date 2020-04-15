import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
import Lights from './lights'
import Skybox from './skybox'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.environment['scene-gltf']
const gltfsrc = '#' + config.name
export default class Environment extends React.Component {
  render() {
    return (
      <Entity>
        <a-gltf-model src={gltfsrc}
          position="0 0 -50"/>
        <Lights/>
        <Skybox/>
      </Entity>
    )
  }
}
