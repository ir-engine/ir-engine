/* global React */
import { Entity } from 'aframe-react'
import DefaultAssets from './assets-default'
import ServerAssets from './assets-server'

const Assets = () => (
  <Entity primitive={'a-assets'}>
    <DefaultAssets />
    <ServerAssets />
  </Entity>
)
export default Assets
