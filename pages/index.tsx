import Layout from '../components/ui/Layout'
import Scene from '../components/xr/scene/index'
import React from 'react'
import Login from '../components/ui/Login'

export default class IndexPage extends React.Component {
  render () {
    return (
      <Layout pageTitle="Home">
        <Login />
        <Scene />
      </Layout>
    )
  }
}
