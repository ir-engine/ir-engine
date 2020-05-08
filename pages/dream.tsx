import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import React from 'react'
const Scene = dynamic(() => import('../components/xr/scene/dream'), { ssr: false })
// import Login from '../components/ui/Login'

export default class DreamPage extends React.Component {
  render() {
    return (
      <Layout pageTitle="Home">
        {/* <Login /> */}
        <Scene />
      </Layout>
    )
  }
}
