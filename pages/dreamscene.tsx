import React from 'react'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/scene-dream-scene'), { ssr: false })

export default class DreamScenePage extends React.Component {
  render () {
    return (
      <Scene />
    )
  }
}
