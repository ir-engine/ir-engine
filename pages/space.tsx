import Layout from '../components/ui/Layout'
import React from 'react'

import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/scene-environment'), { ssr: false })

export default class IndexPage extends React.Component {
  render () {
    return (
      <Layout pageTitle="Home">
        <Scene />
      </Layout>
    )
  }
}
