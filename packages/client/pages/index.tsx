import React from 'react'
import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/index'), { ssr: false })

export const IndexPage = (): any => {
  return (
    <Layout pageTitle="Home">
      <Scene sceneName='landing'/>
    </Layout>
  )
}

export default IndexPage
