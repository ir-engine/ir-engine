import React from 'react'
import NoSSR from 'react-no-ssr'

import Scene from "../components/gl/scene"
import Loading from '../components/gl/loading'
export const IndexPage = (): any => {
  return(
  <NoSSR onSSR={<Loading/>}>
    <Scene />
  </NoSSR>
  )
}

export default IndexPage
