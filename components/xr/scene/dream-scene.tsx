import React from 'react'
import { Entity } from 'aframe-react'
import Skybox from './skybox'
import './style.scss'

export interface DreamSceneProps {
  url: string
}
// TODO: make it render properly on navigation (appears black until refresh)
// Maybe a solution is to set the gltf model as an asset-item dynamically
// e.g. store gltf asset urls in redux, and render them in the assets.tsx from redux state
// and add this url into redux on load
// or it could just be some CORS texture loading issue?
export default function DreamSceneScene(props: DreamSceneProps) {
  return (
    <Entity>
      <a-gltf-model src={props.url}/>
      <Skybox/>
    </Entity>
  )
}
