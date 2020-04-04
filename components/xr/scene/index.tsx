import React from 'react'
import NetworkedScene from './scene-networked'
import LocalScene from './scene-local'

//Networking
export default class SceneRoot extends React.Component {
  state = {
    loggedIn: true // TODO: Add auth and redux store
  };

  constructor(props: any) {
    super(props)
  }

  render() {
    if(this.state.loggedIn)
    return (
      <NetworkedScene />
    )
    else return (
      <LocalScene /> 
    )
  }
}