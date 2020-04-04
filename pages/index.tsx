import Layout from '../components/ui/Layout'
import Scene from '../components/xr/scene'
import {siteDescription, siteTitle} from '../config/server'
import React from 'react'

export default class IndexPage extends React.Component {
  render (){
    return (
      <Layout title={siteTitle.concat(" | ", siteDescription)}>
      <Scene />
    </Layout>
    )
  }
}