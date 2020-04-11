import Layout from '../components/ui/Layout'
import Scene from '../components/xr/scene/index'
import React from 'react'
import Login from '../components/ui/Login'
import { Provider } from 'react-redux'
import { configureStore } from '../redux/store'
import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig

const store = configureStore()

export default class IndexPage extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <Layout pageTitle="Home">
          { !config.loginDisabled && <Login /> }
          <Scene />
        </Layout>
      </Provider>
    )
  }
}
