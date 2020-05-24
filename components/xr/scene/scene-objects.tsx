import { Entity } from 'aframe-react'

export const SceneObjects = () => (
  <Entity>
    <Entity particle-system={{ preset: 'snow', particleCount: 2000 }} />
    <Entity
      text={{ value: 'Hello, A-Frame React!', align: 'center' }}
      position={{ x: 0, y: 2, z: -1 }}
    />

    <Entity
      id="box"
      geometry={{ primitive: 'box' }}
      material={{ color: 'red', opacity: 0.6 }}
      animation__rotate={{
        property: 'rotation',
        dur: 2000,
        loop: true,
        to: '360 360 360'
      }}
      animation__scale={{
        property: 'scale',
        dir: 'alternate',
        dur: 100,
        loop: true,
        to: '1.1 1.1 1.1'
      }}
      position={{ x: 0, y: 1, z: -3 }}
    >
      <Entity
        animation__scale={{
          property: 'scale',
          dir: 'alternate',
          dur: 100,
          loop: true,
          to: '2 2 2'
        }}
        geometry={{
          primitive: 'box',
          depth: 0.2,
          height: 0.2,
          width: 0.2
        }}
        material={{ color: '#24CAFF' }}
      />
    </Entity>
  </Entity>
)

export default SceneObjects
