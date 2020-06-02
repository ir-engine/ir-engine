import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'

export const ComponentName = 'mycomp'

export interface SystemData {
}

export const SystemSchema: AFRAME.Schema<SystemData> = {
}

export interface SystemProps {
  aFunc: (a: number, b: number) => number,
}

export const SystemDef: AFRAME.SystemDefinition<SystemProps> = {
  schema: SystemSchema,
  data: {
  } as SystemData,

  init () {
  },

  play() {
  },

  pause() {
  },

  aFunc(a: number, b: number) {
    return a + b
  }
}

export interface Data {
  [key: string]: any,
  someData: number,
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  someData: { default: 1 }
}

export interface Props {
  initSomething: () => void,
  addHandlers: () => void,
  removeHandlers: () => void,
  aHandler: () => void,
  aProp: boolean
}

export const Component: AFRAME.ComponentDefinition<Props> = {
  schema: ComponentSchema,
  data: {
  } as Data,

  // multiple: true,
  aProp: true,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initSomething()
    else this.el.sceneEl?.addEventListener('loaded', this.initSomething.bind(this))
  },

  play() {
    this.addHandlers()
  },

  pause() {
    this.removeHandlers()
  },

  update(oldData: Data) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('someData')) {
      // update something
    }
    // multiple data
    if (['someData', 'otherData'].some(prop => changedData.includes(prop))) {
      // update
    }
  },

  initSomething() {
  },

  aHandler() {

  },

  addHandlers: function() {
    this.el.addEventListener('an-event', this.aHandler.bind(this))
  },

  removeHandlers: function() {
    this.el.removeEventListener('an-event', this.aHandler)
  }

}

const primitiveProps = ['id', 'someData']

export const Primitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    ...PropertyMapper(primitiveProps, ComponentName),
    'another-prop': '.someOtherComponent.anotherProp',
    'a-nested-prop': ComponentName + '.objectProp.aNestedProp',
    'prop-with-different-name-in-html': ComponentName + '.propNameOnComponent'
  }
}

const ComponentSystem = {
  name: ComponentName,
  system: SystemDef,
  component: Component,
  primitive: Primitive
}

export default ComponentSystem
