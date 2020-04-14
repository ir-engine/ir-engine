import React from 'react'

import dynamic from 'next/dynamic'

const LocalScene = dynamic(() => import('./scene-local'), { ssr: false })

const NetworkedScene = dynamic(() => import('./scene-networked'), {
  ssr: false
})

const AframeComponentRegisterer = dynamic(() => import('../aframe/index'), {
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
    const SceneComponent = this.state.loggedIn ? <NetworkedScene /> : <LocalScene />

    return (
      <div>
        <AframeComponentRegisterer/>
        {SceneComponent}
      </div>

    )
  }
}
