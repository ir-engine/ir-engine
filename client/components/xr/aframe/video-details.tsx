/* eslint-disable @typescript-eslint/restrict-plus-operands */
import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'

import { RoundedCornersPlaneGeometry } from '../three/RoundedCornersPlaneGeometry'

const THREE = AFRAME.THREE

export const ComponentName = 'video-details'

export interface VideoDetailsData {
  cellHeight?: number
  cellWidth?: number
  detailsWidth?: number
  detailsHeight?: number
  contentWidth?: number
  contentHeight?: number
  borderRadius?: number
  // originalTitle: string,
  title: string
  description: string
  url: string
  thumbnailUrl: string
  productionCredit: string
  rating: string
  categories: string[]
  runtime: string
  // tags: string[],
  mediatype: string
  linktype: string
  videoformat: string
  linkEnabled: boolean

  // text defaults
  fontsize: number
  wrapcount: number
  wrapfit: boolean
  nobr: boolean

  backgroundColor: number
  backgroundMargin: number
}

export const VideoDetailsComponentSchema: AFRAME.MultiPropertySchema<VideoDetailsData> = {
  cellHeight: { default: 0.6 },
  cellWidth: { default: 1 },
  detailsWidth: { default: 1 },
  detailsHeight: { default: 1 },
  contentHeight: { default: 0.5 },
  borderRadius: { default: 0.1 },
  // originalTitle: { default: '' },
  title: { default: '' },
  description: { default: '' },
  url: { default: '' },
  thumbnailUrl: { default: '' },
  productionCredit: { default: '' },
  rating: { default: '' },
  categories: { default: [] },
  runtime: { default: '' },
  // tags: { default: [] },
  mediatype: { default: 'video360' },
  linktype: { default: 'internal' },
  videoformat: { default: 'eac' },
  linkEnabled: { default: false },

  fontsize: { default: 2 },
  wrapcount: { default: 50 },
  wrapfit: { default: false },
  nobr: { default: true },

  backgroundColor: { default: 0x222222 },
  backgroundMargin: { default: 0.1 }
}

export interface Props {
  initDetailsl: () => void
  createCell: () => AFRAME.Entity
  createText: (text: string, width: number, height: number,
    fontSize: number, wrapCount: number,
    anchor: string, baseline: string, align: string) => AFRAME.Entity
  createButton: (text: string, bgColor: string, clickevent: string, eventData: string,
    width: number, x: number, y: number, z: number,
    bgWidth: number, bgHeight: number, bgz: number,
    color: number) => AFRAME.Entity
  createDetailsFlex: (h: number) => AFRAME.Entity
  createDetailsItem: (opts: any, text: string) => AFRAME.Entity
  createBackground: (w: number, h: number, r: number, m: number, color: number, x: number, y: number, z: number) => AFRAME.Entity
  createButtons: (h: number) => AFRAME.Entity
  createWatchButton: (w: number, h: number) => AFRAME.Entity
  createBackButton: (w: number, h: number) => AFRAME.Entity
}

export const VideoDetailsComponent: AFRAME.ComponentDefinition<Props> = {
  schema: VideoDetailsComponentSchema,
  data: {
  } as VideoDetailsData,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initDetailsl()
    else this.el.sceneEl?.addEventListener('loaded', this.initDetailsl.bind(this))
  },

  play () {
  },

  pause () {
  },

  initDetailsl () {
    const flexEl = document.createElement('a-entity')
    flexEl.setAttribute('flex-container', {
      width: this.data.detailsWidth,
      height: this.data.detailsHeight,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    })

    const mediaCell = this.createCell()
    mediaCell.setAttribute('flex-item', { dimtype: 'attr', dimattr: 'media-cell' })

    flexEl.appendChild(mediaCell)

    const buttonsRow = this.createButtons(0.07 * this.data.detailsHeight)
    buttonsRow.setAttribute('flex-item', { dimtype: 'flex-container' })

    flexEl.appendChild(buttonsRow)

    // details row
    const detailsCell = this.createDetailsFlex(0.05 * this.data.detailsHeight)
    detailsCell.setAttribute('flex-item', { dimtype: 'flex-container' })

    flexEl.appendChild(detailsCell)

    // title
    if (this.data.title !== undefined) {
      const titleFlexEl = this.createDetailsItem({
        height: 0.1 * this.data.detailsHeight,
        fontsize: 3,
        wrapcount: 30
      }, this.data.title)
      flexEl.appendChild(titleFlexEl)
    }

    // description
    if (this.data.description !== undefined) {
      const descriptionFlexEl = this.createDetailsItem({
        height: 0.23 * this.data.detailsHeight
      }, this.data.description)
      flexEl.appendChild(descriptionFlexEl)
    }

    const categories = (this.data.categories.length === 1 && this.data.categories[0] === 'undefined') ? '' : this.data.categories
    const categoriesFlexEl = this.createDetailsItem({
      height: 0.05 * this.data.detailsHeight
    }, categories)
    flexEl.appendChild(categoriesFlexEl)

    const background = this.createBackground(
      this.data.detailsWidth,
      this.data.detailsHeight,
      this.data.borderRadius,
      this.data.backgroundMargin,
      this.data.backgroundColor,
      0,
      0,
      -0.005
    )

    this.el.appendChild(flexEl)
    this.el.appendChild(background)
  },

  createCell () {
    const mediaCell = document.createElement('a-media-cell')
    const cellData = {
      clickable: false,
      ...this.data
    }
    mediaCell.setAttribute('media-cell', cellData)

    return mediaCell
  },

  createText (text: string, width: number, height: number, fontSize: number, wrapCount: number,
    anchor: string, baseline: string, align: string) {
    const textEntity = document.createElement('a-entity')

    textEntity.setAttribute('text-cell', {
      font: 'roboto',
      width: width,
      height: height,
      align: align,
      baseline: baseline,
      color: '#FFF',
      transparent: false,
      fontsize: fontSize,
      text: text,
      wrapcount: wrapCount,
      anchor: anchor,
      nobr: false
    })
    return textEntity
  },

  createDetailsFlex (height: number) {
    const flexEl = document.createElement('a-entity')
    flexEl.setAttribute('flex-container',
      {
        width: this.data.detailsWidth,
        height: height,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
      })

    const lineHeight = 0.1

    const runtime = (this.data.runtime !== 'undefined') ? this.data.runtime : ''

    const runtimeFlexEl = this.createDetailsItem({
      width: this.detailsWidth / 3,
      height: lineHeight
    }, runtime)
    flexEl.appendChild(runtimeFlexEl)

    const productionCredit = (this.data.productionCredit !== 'undefined') ? this.data.productionCredit : ''
    const productionCreditFlexEl = this.createDetailsItem({
      width: this.detailsWidth / 3,
      height: lineHeight
    }, productionCredit)
    flexEl.appendChild(productionCreditFlexEl)

    const rating = (this.data.rating !== 'undefined') ? this.data.rating : ''
    const ratingFlexEl = this.createDetailsItem({
      width: this.detailsWidth / 3,
      height: lineHeight
    }, rating)
    flexEl.appendChild(ratingFlexEl)

    return flexEl
  },

  createDetailsItem (opts, text) {
    const data = this.data
    const width = opts.width || data.detailsWidth
    const height = opts.height || data.detailsHeight
    const fontsize = opts.fontsize || data.fontsize
    const wrapcount = opts.wrapcount || data.wrapcount
    const wrapfit = opts.wrapfit || data.wrapfit
    const nobr = opts.nobr || data.nobr

    const textProps = {
      width: width,
      height: height,
      fontsize: fontsize,
      wrapcount: wrapcount,
      wrapfit: wrapfit,
      nobr: nobr,
      baseline: 'top'
    }
    const textEl = document.createElement('a-entity')
    textEl.setAttribute('text-cell', { text: text, ...textProps })
    textEl.setAttribute('flex-item', { dimtype: 'attr', dimattr: 'text-cell' })

    return textEl
  },

  createBackground (width: number, height: number, radius: number,
    margin: number, color: number, x: number, y: number, z: number) {
    const bg = document.createElement('a-entity')

    const geo = new RoundedCornersPlaneGeometry(
      width + margin,
      height + margin,
      radius,
      10
    )

    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color)
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.x = x || 0
    mesh.position.y = y || 0
    mesh.position.z = z || 0

    bg.setObject3D('background', mesh)

    return bg
  },

  createButtons (height: number) {
    const flexEl = document.createElement('a-entity')
    flexEl.setAttribute('flex-container',
      {
        width: this.data.detailsWidth,
        height: height,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
      })

    const watchButton = this.createWatchButton(this.data.detailsWidth / 3, height)
    watchButton.setAttribute('flex-item', { dimtype: 'attr', dimattr: 'text-cell' })

    const backButton = this.createBackButton(this.data.detailsWidth / 3, height)
    backButton.setAttribute('flex-item', { dimtype: 'attr', dimattr: 'text-cell' })

    flexEl.appendChild(watchButton)
    flexEl.appendChild(backButton)
    return flexEl
  },

  createButton (text: string, bgColor: string, clickevent: string, eventData: string, width: number,
    xoffset: number, yoffset: number, zoffset: number,
    bgWidth: number, bgHeight: number, bgZoffset = -0.01, color: number) {
    console.debug(color)
    const textEntity = this.createText(text, width, bgHeight, 4, 10, 'center', 'center', 'center')
    textEntity.object3D.position.set(xoffset, yoffset, zoffset)

    const textBGBorder = this.createBackground(bgWidth * 1.03, bgHeight * 1.03, 0.05, 0.01, 'white', 0, 0, bgZoffset - 0.001)
    const textBG = this.createBackground(bgWidth, bgHeight, 0.05, 0.01, bgColor, 0, 0, bgZoffset)
    textBG.classList.add('clickable')
    textBG.setAttribute('clickable', { clickevent: clickevent, clickeventData: JSON.stringify({ url: eventData }) })

    textEntity.appendChild(textBGBorder)
    textEntity.appendChild(textBG)

    return textEntity
  },

  createWatchButton (width: number, height: number) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const url = `video360?manifest=${this.data.url || ''}&title= ${this.data.title || ''}&runtime= ${this.data.runtime || ''}&credit= ${this.data.productionCredit || ''}&rating= ${this.data.rating || ''}&categories= ${this.data.categories.join(',') || ''}&format=${this.data.videoformat || ''}`
    return this.createButton('play', 0x000796, 'navigate', url, width,
      0, 0, 0,
      width, height,
      -0.0025, 0x2b812b)
  },

  createBackButton (width: number, height: number) {
    return this.createButton('back', this.data.backgroundColor, 'backbutton', '', width, // this.data.detailsWidth / 3,
      0, 0, 0,
      width, height,
      -0.0025, 0xb42222)
  }

}

const primitiveProps = [
  'id',
  'cellHeight',
  'cellWidth',
  'detailsHeight',
  'detailsWidth',
  'contentHeight',
  'contentWidth',
  'originalTitle',
  'title',
  'description',
  'thumbnailUrl',
  'productionCredit',
  'rating',
  'categories',
  'runtime',
  'tags',
  'mediatype',
  'linktype',
  'videoformat',
  'linkEnabled',
  'backgroundColor',
  'backgroundMargin'
]

export const VideoDetailsPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  // deprecated: false,
  mappings: {
    ...PropertyMapper(primitiveProps, ComponentName),
    'media-url': ComponentName + '.' + 'url'
  }
}

const ComponentSystem = {
  name: ComponentName,
  component: VideoDetailsComponent,
  primitive: VideoDetailsPrimitive
}

export default ComponentSystem
