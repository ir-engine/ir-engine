import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import React from 'react'
const Scene = dynamic(() => import('../components/xr/scene'), { ssr: false })
// import Login from '../components/ui/Login'
// TODO: Make a TOS page

export default class IndexPage extends React.Component {
  render() {
    return (
      <Layout pageTitle="Home">
        {/* <Login /> */}
        <Scene />
      </Layout>
    )
  }
}
