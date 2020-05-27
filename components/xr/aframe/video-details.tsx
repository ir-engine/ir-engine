import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'

export const ComponentName = 'video-details'

export interface VideoDetailsData {
  cellHeight?: number
  cellWidth?: number
  cellContentHeight?: number
  // originalTitle: string,
  title: string,
  description: string,
  url: string,
  thumbnailUrl: string,
  productionCredit: string,
  rating: string,
  categories: string[],
  runtime: string,
  // tags: string[],
  mediatype: string,
  linktype: string,
  videoformat: string,
  linkEnabled: boolean
}

export const VideoDetailsComponentSchema: AFRAME.MultiPropertySchema<VideoDetailsData> = {
  cellHeight: { default: 0.6 },
  cellWidth: { default: 1 },
  cellContentHeight: { default: 0.5 },
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
  linkEnabled: { default: true }
}

export interface Props {
  initDetailsl: () => void,
  createCell: () => AFRAME.Entity,
  createDetails: () => AFRAME.Entity,
  createText: (text: string, width: number, height: number,
    fontSize: number, wrapCount: number, align: string,
    baseline: string, anchor: string) => AFRAME.Entity,
  createButton: (text: string, bgColor: string, clickevent: string, eventData: string,
    width: number, x: number, y: number, z: number,
    bgWidth: number, bgHeight: number, bgz: number) => AFRAME.Entity,
  createDetailEntity: () => AFRAME.Entity,
  createBackground: (w: number, h: number, color: string, x: number, y: number, z: number) => AFRAME.Entity,
  createWatchButton: () => AFRAME.Entity,
  createBackButton: () => AFRAME.Entity
}

export const VideoDetailsComponent: AFRAME.ComponentDefinition<Props> = {
  schema: VideoDetailsComponentSchema,
  data: {
  } as VideoDetailsData,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initDetailsl()
    else this.el.sceneEl?.addEventListener('loaded', this.initDetailsl.bind(this))
  },

  play() {
  },

  pause() {
  },

  initDetailsl() {
    this.el.appendChild(this.createCell())
    this.el.appendChild(this.createDetails())
  },

  createCell() {
    const mediaCell = document.createElement('a-media-cell')
    mediaCell.setAttribute('media-cell', this.data)

    mediaCell.object3D.scale.set(1.5, 1.5, 1.5)
    mediaCell.object3D.position.set(-0.75, 0, 0)

    return mediaCell
  },

  createDetails() {
    const entity = document.createElement('a-entity')
    entity.object3D.position.set(0.75, 0, 0)

    entity.appendChild(this.createDetailEntity())
    entity.appendChild(this.createWatchButton())
    entity.appendChild(this.createBackButton())

    return entity
  },

  createText(text: string, width: number, height: number, fontSize: number, wrapCount: number, align: string,
    baseline: string, anchor: string) {
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
      anchor: anchor
    })
    return textEntity
  },

  createDetailEntity() {
    let text = this.data.title + '\n\n'
    text += this.data.description ? this.data.description + '\n' : ''
    text += this.data.runtime ? this.data.runtime + '\n' : ''
    text += this.data.productionCredit ? this.data.productionCredit + '\n' : ''
    text += this.data.rating ? this.data.rating + '\n' : ''
    text += this.data.categories ? this.data.categories.join(',') : ''

    const textEntity = this.createText(text, this.data.cellWidth, this.data.cellHeight, 4, 33, 'left', 'center', 'center')

    const textBG = this.createBackground(this.data.cellWidth, this.data.cellContentHeight * 1.5, 'black', 0, -0.0625, -0.01)

    textEntity.appendChild(textBG)

    return textEntity
  },

  createBackground(width: number, height: number, color: string, x: number, y: number, z: number) {
    const bg = document.createElement('a-plane')
    bg.setAttribute('color', color)
    bg.setAttribute('width', width)
    bg.setAttribute('height', height)
    bg.object3D.position.set(x, y, z)

    return bg
  },

  createButton(text: string, bgColor: string, clickevent: string, eventData: string, width: number,
    xoffset: number, yoffset: number, zoffset: number,
    bgWidth: number, bgHeight: number, bgZoffset = -0.01) {
    const textEntity = this.createText(text, width, bgHeight, 6, 10, 'left', 'center', 'center')
    textEntity.object3D.position.set(xoffset, yoffset, zoffset)

    const textBG = this.createBackground(bgWidth, bgHeight, bgColor, 0, 0, bgZoffset)
    textBG.classList.add('clickable')
    textBG.setAttribute('clickable', { clickevent: clickevent, clickeventData: JSON.stringify({ url: eventData }) })

    textEntity.appendChild(textBG)

    return textEntity
  },

  createWatchButton() {
    const url = 'video360?manifest=' + this.data.url +
      '&title=' + this.data.title +
      '&runtime=' + this.data.runtime +
      '&credit=' + this.data.productionCredit +
      '&rating=' + this.data.rating +
      '&categories=' + this.data.categories.join(',') +
      // '&tags=' + this.data.tags.join(',') +
      '&videoformat=' + this.data.videoformat
    return this.createButton('watch', 'green', 'navigate', url, this.data.cellWidth / 2,
      -this.data.cellWidth / 4, -this.data.cellContentHeight, 0,
      this.data.cellWidth / 2, this.data.cellContentHeight / 4,
      -0.01)
  },

  createBackButton() {
    return this.createButton('back', 'red', 'backbutton', '', this.data.cellWidth / 2,
      this.data.cellWidth / 4, -this.data.cellContentHeight, 0,
      this.data.cellWidth / 2, this.data.cellContentHeight / 4,
      -0.01)
  }

}

const primitiveProps = [
  'id',
  'cellHeight',
  'cellWidth',
  'cellContentHeight',
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
  'linkEnabled'
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
