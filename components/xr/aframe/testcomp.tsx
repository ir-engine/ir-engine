// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'

export const ClockName = 'myclock'

export interface ClockData {
    time: number
}

export const ClockSchema: AFRAME.Schema<ClockData> = {
}

export const ClockSystem: AFRAME.SystemDefinition = {
  schema: ClockSchema,
  data: {
    time: 5
  } as ClockData,

  init () {
  },

  play() {
  },

  pause() {
  }

}

export const ClockComponent: AFRAME.ComponentDefinition = {
  schema: ClockSchema,
  data: {
    time: 5
  } as ClockData,

  init () {
    console.log('time: ', this.data.time)
  },

  play() {
  },

  pause() {
  }

}

export const ClockPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ClockName: {}
  },
  deprecated: false,
  mappings: {
    time: ClockName + '.time'
  }
}

const ComponentSystem = {
  name: ClockName,
  system: ClockSystem,
  component: ClockComponent,
  primitive: ClockPrimitive
}

export default ComponentSystem
