import { Entity } from 'aframe-react'

export const Lights = () => (
  <Entity>
    <Entity primitive="a-light" type="ambient" color="#445451" />
    <Entity primitive="a-light" type="point" intensity="2" position="2 4 4" />
  </Entity>
)

export default Lights
