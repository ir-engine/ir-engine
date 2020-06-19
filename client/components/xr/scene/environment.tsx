import React from 'react'
import { Entity } from 'aframe-react'
import Lights from './lights'
import Floor from './floor'
import Skybox from './skybox'

export const Environment = () => {
  return (
    <Entity>
      <Floor />
      <Lights />
      <Skybox />
    </Entity>
  )
}

export default Environment
