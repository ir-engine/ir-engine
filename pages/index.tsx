import Layout from '../components/ui/Layout'
import Scene from '../components/xr/scene'
import {siteDescription, siteTitle} from '../config/server'

import { Provider } from 'react-redux'
import store, { history } from './store'


const router 

const IndexPage = () => (
  
  <Layout title={siteTitle.concat(" | ", siteDescription)}>
    <Scene />

  </Layout>
)

export default IndexPage
