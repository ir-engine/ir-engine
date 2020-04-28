import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
import Skybox from './skybox'
import { useRouter } from 'next/router'

export default function EnvironmentDream() {
  const router = useRouter()
  const url = router.query.url as string
  const x = router.query.x as string || 0
  const y = router.query.y as string || 0
  const z = router.query.z as string || 0
  const scale = router.query.scale as string || 1
  const scaleString = scale + ' ' + scale + ' ' + scale

  const position = x + ' ' + y + ' ' + z
  return (
    <Entity>
      <a-gltf-model src={url}
        position={position}
        scale={scaleString}/>
      <Skybox/>
    </Entity>
  )
}
