import React from 'react'

export default class DefaultAssets extends React.Component {
  componentDidMount() {
  }

  render() {
    return (
      <div>
        <img
          id="groundTexture"
          src="https://cdn.aframe.io/a-painter/images/floor.jpg"
          crossOrigin="anonymous"
        />
        <img
          id="skyTexture"
          src="https://cdn.aframe.io/a-painter/images/sky.jpg"
          crossOrigin="anonymous"
        />
      </div>
    )
  }
}
