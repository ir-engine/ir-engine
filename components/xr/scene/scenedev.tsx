import React from 'react'
// @ts-ignore
import { Scene, Assets, Entity } from 'aframe-react'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'
import AframeComponentRegisterer from '../aframe/index'

import getConfig from 'next/config'
// const feathers = require('@feathersjs/feathers')
// const rest = require('@feathersjs/rest-client')
const env = getConfig().publicRuntimeConfig.xr.environment
const grid = getConfig().publicRuntimeConfig.xr.grid
const landing = getConfig().publicRuntimeConfig.xr.landing

type Props = {
  children?: any
}

type State = {
  color?: string // do we need this?
  currentScene?: string | null
}

export default class SceneRoot extends React.Component<Props> {
  state: State = {
    color: 'red',
    currentScene: null
  }

  onComponentDidMount() {
    const app = feathers()

    // // Connect to a different URL

    // // TODO: Replace with server
    // const restClient = rest('http://localhost:3030')

    // // Configure an AJAX library (see below) with that client
    // // @ts-ignore
    // app.configure(restClient.fetch(window.fetch))

    // // Fetch resources

    // // Get the scene -- an ECS friendly list of lists representation
    // const scene = app.service('scene').get(1, {
    //   type: 'scene',
    //   name: 'index'
    // })

    // // GetScene API -- return Collection: {}, Entities: [], Components: [], Resources: [] so flat lists so we can consume as ECS
    // console.log(scene.resources)
    // const sceneResources = scene.resources

    // console.log(scene.components)
    // const sceneComponents = scene.components

    // console.log(scene.entities)
    // const sceneEntities = scene.entities

    // console.log(scene.collection)
    // const sceneCollection = scene.collection

    // // set currentScene to fetched scene
    // this.setState({ currentScene: sceneCollection.name })

    // // Get list of existing a-asset. If these had the same ID as new resource, don't destroy them
    // this.removeExistingAssets()

    // // Vice versa, create new a-assets, if resource already exists in scene as a-asset, don't create it
    // this.addNewAssets(sceneResources)

    // // Associate resources with components where necessary
    // this.createEntities(sceneEntities, sceneComponents, sceneResources)
  }

  removeExistingAssets = () => {
    console.error('Unimplimented function!')
    // Get list of existing entities with sceneEntity class -- oldSceneEntities
    // Animate oldSceneEntities to animate and destroy on end of animation (position, fade, etc)
  }

  addNewAssets = (assets: any) => {
    console.error('Unimplimented function: '.concat(assets))
    // Create new entities, give them component "sceneEntity"
    // Animate new entities in (position, fade, etc)
  }

  createEntities = (sceneEntities: any, sceneComponents: any, sceneResources: any) => {
    console.error('Unimplimented function: '.concat(sceneEntities).concat(sceneComponents).concat(sceneResources))
    //  Create + register components and attach them to entities (reference a-assets?)
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Scene
          vr-mode-ui="enterVRButton: #enterVRButton"
          loading-screen="dotsColor: purple; backgroundColor: black; enabled: true"
          class="scene"
          renderer="antialias: true"
        >
          <AframeComponentRegisterer />

          <Assets id="aframeAssets">
            {/* Fetch resources and place here */}
            <img
              id="groundTexture"
              src={env.floor.src}
              crossOrigin="anonymous"
            />
            <img id="skyTexture" src={env.skybox.src} crossOrigin="anonymous" />
            <img id="gridSky" src={grid.skybox.src} crossOrigin="anonymous" />
            <img
              id="placeholder"
              src={grid.placeholderImageSrc}
              crossOrigin="anonymous"
            />
            <img id="spoke" src={landing.spoke.src} crossOrigin="anonymous" />
            <img id="vrRoom" src={landing.vrRoom.src} crossOrigin="anonymous" />
            <img
              id="video360banner"
              src={landing.video360.src}
              crossOrigin="anonymous"
            />
            <img
              id="storebanner"
              src={landing.store.src}
              crossOrigin="anonymous"
            />

            <Entity
              primitive="a-gltf-model"
              id={env['scene-gltf'].name}
              src={env['scene-gltf'].src}
              crossOrigin="anonymous"
            />

            <video id="video360Shaka" crossOrigin="anonymous"></video>
          </Assets>

          <Player />
          <Environment />

          {/* Scene Collection goes Here */}

          {this.props.children}
          <a className="enterVR" id="enterVRButton" href="#">
            <SvgVr className="enterVR" />
          </a>
        </Scene>
      </div>
    )
  }
}
