import React from 'react'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/scene-video'), { ssr: false })

export default class IndexPage extends React.Component {
  render () {
    return (
      <Scene />
    )
  }
}
