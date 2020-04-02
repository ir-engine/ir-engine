/* global AFRAME, NAF */

import React from 'react'
import dynamic from 'next/dynamic';

const NetworkedScene = dynamic(() : any => {
  import('./scene-networked')
}
, {
	ssr: false
});

const LocalScene = dynamic(() : any => {
  import('./scene-local')
}
, {
	ssr: false
})

//Networking
export default class Scene extends React.Component {
  state = {
    loggedIn: false // TODO: Add auth and vuex store
  };

  isLoggedIn() {
    return this.state.loggedIn
  }

  constructor(props: any) {
    super(props);  
  }

getNetworkScene() {
  if(this.isLoggedIn()) 
    ( <NetworkedScene /> )
  else
    return ( <LocalScene /> )
}

  render() {
    return (
      <div>
      <div id="sceneContainer" />

{ this.getNetworkScene() }


      </div>

    )

  }
}