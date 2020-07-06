import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'

export const ComponentName = 'flex-container'

export interface SystemData {
}

export const SystemSchema: AFRAME.Schema<SystemData> = {
}

export interface SystemProps {
  updateLayout: (data: Data, children: any[]) => void
  _justifyContent: (val: string, length: number, contentLength: number, space: number) => number
  _justifySpace: (val: string, length: number, contentLength: number, numItems: number) => number
  _childrenLength: (children: any[], flexDirection: string) => number
  _margin: (flexItem: any, direction: string) => number
  _alignItems: (val: string, containerLength: number, contentLength: number) => number
}

export const SystemDef: AFRAME.SystemDefinition<SystemProps> = {
  schema: SystemSchema,
  data: {
  } as SystemData,

  init () {
  },

  play () {
  },

  pause () {
  },

  updateLayout (data: Data, children: any[]) {
    let offsetX: number = 0
    let offsetY: number = 0
    const mainAxis = data.flexDirection
    // const crossAxis = mainAxis === 'row' ? 'column' : 'row'
    const mainAxisLength = this._childrenLength(children, mainAxis)
    // const crossAxisLength = this._childrenLength(children, crossAxis)
    const mainAxisDimension = mainAxis === 'row' ? 'width' : 'height'
    const space: number = this._justifySpace(data.justifyContent, data[mainAxisDimension], mainAxisLength, children.length)
    switch (data.flexDirection) {
      case 'row':
        offsetX += this._justifyContent(data.justifyContent, data.width, mainAxisLength, space) as number
        break
      case 'column':
        offsetY -= this._justifyContent(data.justifyContent, data.height, mainAxisLength, space)
        break
      default:
        break
    }
    children.forEach(child => {
      const childFlexItem = child.getAttribute('flex-item')
      let posx, posy
      switch (data.flexDirection) {
        case 'row':
          posx = offsetX + childFlexItem.width / 2
          posy = offsetY - this._alignItems(data.alignItems, data.height, childFlexItem.height)

          offsetX += childFlexItem.width as number + space
          break
        case 'column':
          posx = offsetX + (this._alignItems(data.alignItems, data.width, childFlexItem.width) as number)

          posy = offsetY - childFlexItem.height / 2
          offsetY -= childFlexItem.height as number + space
          break
        default:
          break
      }

      child.object3D.position.set(posx, posy, 0.001)
    })
  },

  // defines the alignment along the main axis
  _justifyContent (val, length, contentLength, space) {
    switch (val) {
      case 'flexStart': // JustifyContentType.FlexStart:
      case 'space-between': // JustifyContentType.SpaceBetween:
        return -length / 2
      case 'flexEnd': // JustifyContentType.FlexEnd:
        return length / 2 - contentLength
      case 'space-around': // JustifyContentType.SpaceAround:
        return (space - length) / 2
      case 'space-evenly': // JustifyContentType.SpaceEvenly:
        return space - (length / 2)
      case 'center': // JustifyContentType.Center:
      default:
        return -contentLength / 2
    }
  },

  _justifySpace (val, length, contentLength, numItems) {
    const totalSpace = length - contentLength

    switch (val) {
      case 'space-between':
        return totalSpace / (numItems - 1)
      case 'space-around':
        return totalSpace / numItems
      case 'space-evenly':
        return totalSpace / (numItems + 1)
      default:
        return 0
    }
  },

  _childrenLength (children, flexDirection = 'row') {
    let result = 0

    const dimension = flexDirection === 'row' ? 'width' : 'height'
    // const marginDirection = flexDirection == 'row' ? 'x' : 'y'
    children.forEach(child => {
      const flexItem = child.getAttribute('flex-item')
      result += flexItem[dimension] as number
    })
    return result
  },

  _margin (flexItem, direction) {
    const margin = flexItem['margin' + direction]
    if (margin.x) { return margin.x as number + (margin.y as number) } else return 0
  },

  _alignItems (val, containerLength, contentLength) {
    switch (val) {
      case 'flexStart':
        return (contentLength - containerLength) / 2
      case 'flexEnd':
        return (containerLength - contentLength) / 2
      case 'center':
      default:
        return 0
    }
  }
}

// export enum FlexDirectionType {
//   Row, Column
// }
// export enum JustifyContentType {
//   FlexStart, FlexEnd, Center, SpaceBetween, SpaceAround, SpaceEvenly
// }

// export enum AlignItemsType {
//   FlexStart, FlexEnd, Center
// }

// export enum DimType {
//   El,
//   FlexContainer
// }

export interface Data {
  [key: string]: any
  width: number
  height: number
  flexDirection: string
  justifyContent: string
  alignItems: string
  dimtype: string
  needsupdate: boolean
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  width: { default: 1 },
  height: { type: 'number', default: 1 },
  flexDirection: { default: 'row' },
  justifyContent: {
    default: 'flexStart'
  },
  alignItems: {
    default: 'center'
  }, // TODO : stretch
  dimtype: { default: 'el' },
  needsupdate: { default: true }
  /* TODO
            flex-wrap
            align-content
        */

}

export interface Props {
  initFlexContainer: () => void
  addHandlers: () => void
  removeHandlers: () => void
  // aHandler: () => void
  updateChildren: () => void
  flexItemAppendedHandler: (e: any) => void
}

export const Component: AFRAME.ComponentDefinition<Props> = {
  schema: ComponentSchema,
  data: {
  } as Data,

  // multiple: true,

  init () {
    // this.aHandler = this.aHandler.bind(this)
    this.initFlexContainer = this.initFlexContainer.bind(this)
    if (this.el.sceneEl?.hasLoaded) this.initFlexContainer()
    else this.el.sceneEl?.addEventListener('loaded', this.initFlexContainer)
  },

  play () {
    this.addHandlers()
  },

  pause () {
    this.removeHandlers()
  },

  remove () {
    this.el.sceneEl?.removeEventListener('loaded', this.initFlexContainer)
  },

  update (oldData: Data) {
    // if (this.data.needsupdate) {
    this.updateChildren()
    this.system.updateLayout(this.data, this.children)
    this.el.setAttribute('flex-container', { needsupdate: false })
    // }
  },

  initFlexContainer () {
    this.el.isFlexContainer = true

    switch (this.data.dimtype) {
      case 'el':
        this.data.width = +this.el.getAttribute('width') || this.data.width
        this.data.height = +this.el.getAttribute('height') || this.data.height
        break
      default:
        break
    }

    this.updateChildren()
  },

  addHandlers: function () {
    // this.el.addEventListener('an-event', this.aHandler)
  },

  removeHandlers: function () {
    // this.el.removeEventListener('an-event', this.aHandler)
  },

  updateChildren () {
    this.children = this.el.getChildEntities().filter((el) => { return el.isFlexItem })
  },

  flexItemAppendedHandler (evt) {
    this.system.updateLayout(this.data, this.children)
  }
}

const primitiveProps = ['flexDirection', 'justifyContent', 'alignItems']

export const Primitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {},
    'flex-item': { dimtype: 'flexContainer' }
  },
  deprecated: false,
  mappings: {
    ...PropertyMapper(primitiveProps, ComponentName),
    width: '.flex-item.width',
    height: '.flex-item.height',
    maginx: '.flex-item.marginx',
    maginy: '.flex-item.marginy',
    marginz: '.flex-item.marginz'
  }
}

const ComponentSystem = {
  name: ComponentName,
  system: SystemDef,
  component: Component,
  primitive: Primitive
}

export default ComponentSystem
