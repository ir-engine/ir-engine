/* global AFRAME, NAF */

import React from 'react'
import dynamic from 'next/dynamic';
import ReactDOM from 'react-dom';

//Networking
export default class SceneRoot extends React.Component {
  state = {
    loggedIn: false // TODO: Add auth and vuex store
  };

  constructor(props: any) {
    super(props); 
  }

  render() {
    return (
      <div id="sceneContainer" />
    )
  }

  componentDidMount(){
    console.log("component mounted")
    const Scene = dynamic(() : any => {
      this.state.loggedIn ? import('./scene-networked') :  import('./scene-local')
    }, {
      ssr: false
    }); 
    console.log(Scene)

    ReactDOM.render(<Scene />, document.querySelector('#sceneContainer'));
  }
}