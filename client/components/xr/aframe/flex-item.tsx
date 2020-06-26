import AFRAME from 'aframe'

export const ComponentName = 'flex-item'

export interface Data {
  [key: string]: any
  width: number
  height: number
  dimtype: string
  dimattr: string
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  width: { default: 1 },
  height: { default: 1 },
  dimtype: { default: 'el' },
  dimattr: { default: '' }
  // x positive, y negative
  // marginx: { type: 'vec2', default: { p: 0, n: 0 } },
  // marginy: { type: 'vec2', default: { p: 0, p: 0 } },
  // marginz: { type: 'vec2', default: { p: 0, n: 0 } },

  /* TODO
      margin
      order
      flex-grow
      flex-shrink
      flex-basis
      align-self
  */
}

export interface Props {
  initSomething: () => void
  addHandlers: () => void
  removeHandlers: () => void
  aHandler: () => void
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

  play () {
    this.addHandlers()
  },

  pause () {
    this.removeHandlers()
  },

  update (oldData: Data) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('someData')) {
      // update something
    }
    // multiple data
    if (['someData', 'otherData'].some(prop => changedData.includes(prop))) {
      // update
    }
  },

  initSomething () {
    this.el.isFlexItem = true

    switch (this.data.dimtype) {
      case 'el':
        this.data.width = +this.el.getAttribute('width') || this.data.width
        this.data.height = +this.el.getAttribute('height') || this.data.height
        break
      case 'attr':
      case 'attribute':
        if (this.data.dimattr) {
          this.data.width = +this.el.getAttribute(this.data.dimattr).width || this.data.width
          this.data.height = +this.el.getAttribute(this.data.dimattr).height || this.data.height
        } else {
          console.warn('dimtype is attribute but dimattr is undefined')
        }
        break
      case 'flex-container':
        this.data.width = +this.el.getAttribute('flex-container').width || this.data.width
        this.data.height = +this.el.getAttribute('flex-container').height || this.data.height
        break
      case 'sphere':
        // eslint-disable-next-line no-case-declarations
        const radius = +this.el.getAttribute('radius')
        this.data.width = radius * 2 || this.data.width
        this.data.height = radius * 2 || this.data.height
        break
      default:
        break
    }
  },

  aHandler () {

  },

  addHandlers: function () {
    this.el.addEventListener('an-event', this.aHandler.bind(this))
  },

  removeHandlers: function () {
    this.el.removeEventListener('an-event', this.aHandler)
  }

}

const ComponentSystem = {
  name: ComponentName,
  component: Component
}

export default ComponentSystem
