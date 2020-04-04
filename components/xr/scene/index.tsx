import React from 'react'

import dynamic from 'next/dynamic'

const LocalScene = dynamic(() => import('./scene-local'), { ssr: false })

const NetworkedScene = dynamic(() => import('./scene-networked'), {
  ssr: false
})

type State = {
  loggedIn: true // TODO: Add auth and redux store
}

// Networking
export default class SceneRoot extends React.Component {
  state: State = {
    loggedIn: true // TODO: Add auth and redux store
  }

  render() {
    if (this.state.loggedIn) return <NetworkedScene />
    else return <LocalScene />
  }
}
