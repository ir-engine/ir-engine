import React from 'react'
import { Entity } from 'aframe-react'
import Skybox from './skybox'
import './style.scss'

export interface DreamSceneProps {
  url: string
}

export default function DreamSceneScene(props: DreamSceneProps) {
  return (
    <Entity>
      <a-gltf-model src={props.url}/>
      <Skybox/>
    </Entity>
  )
}
