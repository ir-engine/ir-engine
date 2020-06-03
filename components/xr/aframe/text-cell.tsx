import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'

const THREE = AFRAME.THREE

export const ComponentName = 'text-cell'

const loadBMFont = require('load-bmfont')

const FONT_BASE_URL = 'https://cdn.aframe.io/fonts/'
const FONTS = {
  aileronsemibold: FONT_BASE_URL + 'Aileron-Semibold.fnt',
  dejavu: FONT_BASE_URL + 'DejaVu-sdf.fnt',
  exo2bold: FONT_BASE_URL + 'Exo2Bold.fnt',
  exo2semibold: FONT_BASE_URL + 'Exo2SemiBold.fnt',
  kelsonsans: FONT_BASE_URL + 'KelsonSans.fnt',
  monoid: FONT_BASE_URL + 'Monoid.fnt',
  mozillavr: FONT_BASE_URL + 'mozillavr.fnt',
  roboto: FONT_BASE_URL + 'Roboto-msdf.json',
  sourcecodepro: FONT_BASE_URL + 'SourceCodePro.fnt'
}
const DEFAULT_FONT = 'roboto'

export interface SystemData {
}

export const SystemSchema: AFRAME.Schema<SystemData> = {
}

interface position {
  x: number
  y: number
  z: number
}

export interface SystemProps {
  getOrLoadFont: (src: string, yOffset: number) => any,
  loadFont: (src: string, yOffset: number) => Promise<any>,
  computeFontWidthFactor: (font: any) => number,
  computeWidth: (wrapPixels: number, wrapCount: number, widthFactor: number) => number,
  comparePositions(posA: position, posB: position),
  cache: Map<string, any>
}

export const SystemDef: AFRAME.SystemDefinition<SystemProps> = {
  schema: SystemSchema,
  data: {
  } as SystemData,

  cache: new Map(),

  init () {
    const oldUpdateLayout = (AFRAME.components.text.Component.prototype as any).updateLayout;
    (AFRAME.components.text.Component.prototype as any).updateLayout = function() {
      oldUpdateLayout.call(this)
      this.el.emit('textlayoutchanged', { name: this.attrName, id: this.id })
    }
  },

  play() {
  },

  pause() {
  },

  getOrLoadFont (src: string, yOffset: number) {
    return this.cache.get(src) || this.loadFont(src, yOffset)
  },

  loadFont (src: string, yOffset: number) {
    return new Promise((resolve, reject) => {
      loadBMFont(src, (err, font) => {
        if (err) {
          console.error('Error loading font', src)
          reject(err)
          return
        }
        // Fix negative Y offsets for Roboto MSDF font from tool. Experimentally determined.
        if (src.indexOf('/Roboto-msdf.json') >= 0) { yOffset = 30 }
        if (yOffset) { font.chars.map((ch) => { ch.yoffset += yOffset }) }
        this.cache.set(src, font)
        resolve(font)
      })
    })
  },

  computeFontWidthFactor (font) {
    let sum = 0
    let digitsum = 0
    let digits = 0
    font.chars.map((ch) => {
      sum += ch.xadvance
      if (ch.id >= 48 && ch.id <= 57) {
        digits++
        digitsum += ch.xadvance
      }
    })
    return digits ? digitsum / digits : sum / font.chars.length
  },

  computeWidth (wrapPixels, wrapCount, widthFactor) {
    return wrapPixels || ((0.5 + wrapCount) * widthFactor)
  },

  comparePositions(posA: position, posB: position) {
    return posA.x === posB.x && posA.y === posB.y && posA.z === posB.z
  }
}

export interface Data {
  [key: string]: any,
  id: string

  width: number
  height: number

  text: string

  color: string

  fontsize: number
  wrapcount: number
  wrappixels: number

  nobr: boolean

  border: boolean
  bordersize: number
  borderColor: string

  wrapfit: boolean

  // justifycontent: string
  anchor: string
  align: string
  baseline: string
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  id: { type: 'string', default: '' },

  width: { type: 'number', default: 0.6 },
  height: { type: 'number', default: 0.6 },

  text: { type: 'string', default: 'text' },

  color: { default: '#FFF' },

  fontsize: { type: 'number', default: 1 },
  wrapcount: { type: 'number', default: 20 },
  wrappixels: { type: 'number', default: 0 },

  nobr: { type: 'boolean', default: false },

  border: { type: 'boolean', default: true },
  bordersize: { type: 'number', default: 0.05 },
  borderColor: { default: '#484848' },

  wrapfit: { type: 'boolean', default: false },

  // justifycontent: { type: 'string', default: 'flexStart' },
  anchor: { type: 'string', default: 'center' },
  align: { type: 'string', default: 'center' },
  baseline: { type: 'string', default: 'center' }
}

interface offsetInterface {
  x?: number
  y?: number
  z?: number
}

export interface Props {
  initTextCell: () => void,
  initializeFont: (font: any) => void,
  addHandlers: () => void,
  removeHandlers: () => void,
  clippingSetUp: boolean,
  worldPosition: any,
  lineHeight: number,
  widthFactor: number,
  textRenderWidth: number,
  textScale: number,
  textHeight: number,
  createText: (opts: createTextOpts) => void,
  setUpTextHandler: (id: string, offset: offsetInterface) => void,
  textLayoutChangedHandler: (evt: any) => void,
  setUpClipping: (id: string) => void,
  updateClipping: (id: string) => void
}

interface createTextOpts {
  id?: string
  fontsize?: number
  width?: number
  wrapcount?: number
  text?: string
  height?: number
  color?: number
  align?: string
  baseline?: string
}

export const Component: AFRAME.ComponentDefinition<Props> = {
  schema: ComponentSchema,
  data: {
  } as Data,

  clippingSetUp: false,
  worldPosition: {},
  lineHeight: 0,
  widthFactor: 0,
  textRenderWidth: 0,
  textScale: 0,
  textHeight: 0,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initTextCell()
    else this.el.sceneEl?.addEventListener('loaded', this.initTextCell.bind(this))
  },

  play() {
    this.addHandlers()
  },

  pause() {
    this.removeHandlers()
  },

  update() {
    const self = this
    const data = self.data

    const textName = data.id !== '' ? `text__${data.id}` : 'text'

    self.el.removeAttribute(textName)

    const font = self.data.font || DEFAULT_FONT

    const loadedFont = this.system.getOrLoadFont(FONTS[font])

    if (loadedFont.then) loadedFont.then((result) => { this.initializeFont(result) })
    else this.initializeFont(loadedFont)
  },

  tick() {
    const position = new THREE.Vector3()
    this.el.object3D.getWorldPosition(position)
    if (!!this.worldPosition && !this.system.comparePositions(this.worldPosition, position)) {
      this.updateClipping(this.data.id)
      this.worldPosition = position
    }
  },

  initializeFont(font) {
    this.lineHeight = font.common.lineHeight
    this.widthFactor = this.system.computeFontWidthFactor(font)
    this.textRenderWidth = this.system.computeWidth(this.data.wrappixels, this.data.wrapcount,
      this.widthFactor)

    this.textScale = this.data.width / this.textRenderWidth
    this.textHeight = this.lineHeight * this.textScale * this.data.fontsize

    this.el.addEventListener('textlayoutchanged', this.textLayoutChangedHandler.bind(this),
      { once: true })

    this.createText({
      id: this.data.id,
      text: this.data.text,
      width: this.data.width,
      height: this.data.height,
      color: this.data.color
    })
  },

  initTextCell() {
    this.worldPosition = this.el.object3D.getWorldPosition()
  },

  createText(opts: createTextOpts) {
    const self = this
    const data = self.data
    const id = opts.id || ''
    const textName = id !== '' ? `text__${id}` : 'text'

    const fontSize = opts.fontsize || data.fontsize
    const width = opts.width || data.width
    let wrapCount = opts.wrapcount || data.wrapcount
    if (data.wrapfit) {
      wrapCount = (width / fontSize) * (20 / 0.3)
    }
    const wrapSize = (wrapCount) / 20
    const widthScale = 0.3 / (width)
    const textWidth = width * fontSize * widthScale * wrapSize
    const xOffset = (textWidth - width) / 2

    const text = opts.text || data.text
    const height = opts.height || data.height
    const color = opts.color || data.color
    const align = opts.align || data.align
    const baseline = opts.baseline || data.baseline

    self.el.setAttribute(textName, {
      // id: id,
      value: text,
      width: textWidth,
      height: height,
      wrapCount: wrapCount,
      xOffset: xOffset,
      color: color,
      anchor: data.anchor,
      align: align,
      baseline: baseline
    })

    const textObj = self.el.getObject3D(textName)
    this.textObj = textObj
  },

  setUpTextHandler(id: string, offset: offsetInterface) {
    const self = this
    const object3DName = id !== '' ? `text__${id}` : 'text'
    const textObj = self.el.getObject3D(object3DName)
    const lineHeight = textObj.geometry.layout._lineHeight
    const linesTotal = textObj.geometry.layout._linesTotal
    const textScale = textObj.scale.x
    const halfLines = linesTotal % 2 === 0 ? linesTotal / 2 : (linesTotal) / 2 - 1
    let offsetY = self.data.height / 2
    if (linesTotal > 1) { offsetY -= halfLines * (lineHeight * textScale) } else { offsetY -= (lineHeight * textScale) / 2 }

    textObj.translateY(offsetY)
    if (offset.x) textObj.translateX(offset.x)
    if (offset.y) textObj.translateY(offset.y)
    if (offset.z) textObj.translateZ(offset.z)

    self.setUpClipping(id)
  },

  setUpClipping(id: string) {
    const self = this
    const el = self.el
    if (self.clippingSetUp) {
      return
    }

    const object3DName = id !== '' ? `text__${id}` : 'text'
    const textObj = self.el.getObject3D(object3DName)
    const lineHeight = textObj.geometry.layout._lineHeight
    // const linesTotal = textObj.geometry.layout._linesTotal
    const textScale = textObj.scale.x

    const offsetY = 0

    const renderer = el.sceneEl.renderer
    renderer.localClippingEnabled = true

    el.sceneEl.object3D.updateMatrixWorld()
    const pos = new THREE.Vector3()
    el.object3D.getWorldPosition(pos)
    const posy = pos.y
    const height = textObj.geometry.layout._opt.height

    const normalBot = new THREE.Vector3(0, 1, 0)
    let constantBot = -(posy + self.data.height / 2 + offsetY - height)

    if (self.data.nobr) {
      const lineRemainder = (height) % (lineHeight * textScale)
      constantBot -= lineRemainder
    }

    const clippingPlaneBot = new THREE.Plane(normalBot, constantBot)
    self.clippingPlaneBot = clippingPlaneBot

    const normalTop = new THREE.Vector3(0, -1, 0)
    const constantTop = posy + self.data.height / 2 + offsetY

    const clippingPlaneTop = new THREE.Plane(normalTop, constantTop)
    self.clippingPlaneTop = clippingPlaneTop

    const mat = textObj.material
    mat.clipping = true
    mat.clippingPlanes = [clippingPlaneBot, clippingPlaneTop]

    mat.vertexShader = 'precision highp float;\n' +
          '#include  <clipping_planes_pars_vertex>\n' +
          mat.vertexShader.replace(/(void main.*)/, '$1\n  #include <begin_vertex>')
            .replace(/}$/, '  #include <project_vertex>\n  #include <clipping_planes_vertex>\n}')

    mat.fragmentShader = 'precision highp float;\n' +
          '#include  <clipping_planes_pars_fragment>\n' +
          mat.fragmentShader.replace(/(void main.*)/, '$1\n  #include <clipping_planes_fragment>')

    // set isMeshBasicMaterial so that the WebGLRenderer updates opacity uniform during animations
    mat.isMeshBasicMaterial = true
    mat.needsUpdate = true
    self.clippingSetUp = true
  },

  updateClipping(id: string) {
    const self = this
    const el = self.el
    if (!self.clippingPlaneTop) { return }

    const object3DName = id !== '' ? `text__${id}` : 'text'
    const textObj = self.el.getObject3D(object3DName)
    if (!textObj || !textObj.geometry || !textObj.geometry.layout) {
      return
    }
    const lineHeight = textObj.geometry.layout._lineHeight
    // const linesTotal = textObj.geometry.layout._linesTotal
    const textScale = textObj.scale.x

    const offsetY = 0

    el.sceneEl.object3D.updateMatrixWorld()
    const pos = new THREE.Vector3()
    el.object3D.getWorldPosition(pos)
    const posy = pos.y
    const height = textObj.geometry.layout._opt.height

    let constantBot = -(posy + self.data.height / 2 + offsetY - height)
    self.clippingPlaneBot.constant = constantBot

    if (self.data.nobr) {
      const lineRemainder = (height) % (lineHeight * textScale)
      constantBot -= lineRemainder
    }

    const constantTop = posy + self.data.height / 2 + offsetY
    self.clippingPlaneTop.constant = constantTop
    const mat = textObj.material

    mat.needsUpdate = true
  },

  textLayoutChangedHandler(evt) {
    this.setUpTextHandler(evt.detail.id || '', {})
  },

  addHandlers: function() {
    this.el.removeEventListener('textlayoutchanged', this.textLayoutChangedHandler.bind(this))
  },

  removeHandlers: function() {
    this.el.removeEventListener('textlayoutchanged', this.textLayoutChangedHandler.bind(this))
  }

}

const primitiveProps = [
  'id',
  'width',
  'height',
  'fontsize',
  'wrapcount',
  'nobr',
  'color',
  'font',
  'wrapfit',
  'lines',
  'anchor',
  'align',
  'baseline'
]

export const Primitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    ...PropertyMapper(primitiveProps, ComponentName),
    value: ComponentName + '.text'
  }
}

const ComponentSystem = {
  name: ComponentName,
  system: SystemDef,
  component: Component,
  primitive: Primitive
}

export default ComponentSystem
