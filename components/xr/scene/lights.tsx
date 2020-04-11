import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

export default class Lights extends React.Component {
  render() {
    return (
      <Entity>
        <Entity primitive="a-light" type="ambient" color="#445451" />
        <Entity
          primitive="a-light"
          type="point"
          intensity="2"
          position="2 4 4"
        />
      </Entity>
    )
  }
}
