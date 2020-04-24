import React from 'react'

import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./scene-explore'), { ssr: false })

type State = {
  loggedIn: true // TODO: Add auth and redux store
}

export default class SceneRoot extends React.Component {
  state: State = {
    loggedIn: true // TODO: Add auth and redux store
  }

  render() {
    return (
      <div>
        <Scene />
      </div>

    )
  }
}
