import AFRAME from 'aframe'

export const ComponentName = 'video-details'

export interface VideoDetailsData {
  cellHeight?: number
  cellWidth?: number
  cellContentHeight?: number
  // originalTitle: string,
  title: string,
  description: string,
  url: string, // TODO: type for url's
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
  url: { default: '' }, // TODO: type for url's
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

export interface VideoDetailsProps {
  initDetailsl: () => void,
  createCell: () => AFRAME.Entity,
  createDetails: () => AFRAME.Entity,
  createText: (text: string, width: number) => AFRAME.Entity,
  createButton: (text: string, bgColor: string, clickevent: string, width: number,
    x: number, y: number, z: number,
    bgWidth: number, bgHeight: number, bgz: number) => AFRAME.Entity,
  createDetailEntity: () => AFRAME.Entity,
  createBackground: (w: number, h: number, color: string, x: number, y: number, z: number) => AFRAME.Entity,
  createWatchButton: () => AFRAME.Entity,
  createBackButton: () => AFRAME.Entity
}

export const VideoDetailsComponent: AFRAME.ComponentDefinition<VideoDetailsProps> = {
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

  createText(text: string, width: number) {
    const textEntity = document.createElement('a-entity')

    textEntity.setAttribute('text', {
      font: 'roboto',
      width: width,
      align: 'center',
      baseline: 'center',
      color: 'white',
      transparent: false,
      value: text
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

    const textEntity = this.createText(text, 2)

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

  createButton(text: string, bgColor: string, clickevent: string, width: number,
    xoffset: number, yoffset: number, zoffset: number,
    bgWidth: number, bgHeight: number, bgZoffset = -0.01) {
    const textEntity = this.createText(text, width)
    textEntity.object3D.position.set(xoffset, yoffset, zoffset)

    const textBG = this.createBackground(bgWidth, bgHeight, bgColor, 0, 0, bgZoffset) // - bgHeight / 2
    textBG.classList.add('clickable')
    textBG.setAttribute('clickable', { clickevent: clickevent })

    textEntity.appendChild(textBG)

    return textEntity
  },

  createWatchButton() {
    return this.createButton('watch', 'green', 'watchbutton', this.data.cellWidth * 2,
      -this.data.cellWidth / 4, -this.data.cellContentHeight, 0,
      this.data.cellWidth / 2, this.data.cellContentHeight / 4, -0.01)
  },

  createBackButton() {
    return this.createButton('back', 'red', 'backbutton', this.data.cellWidth * 2,
      this.data.cellWidth / 4, -this.data.cellContentHeight, 0,
      this.data.cellWidth / 2, this.data.cellContentHeight / 4, -0.01)
  }

}

export const VideoDetailsPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  // deprecated: false,
  mappings: {
    id: ComponentName + '.id',
    'cell-height': ComponentName + '.cellHeight',
    'cell-width': ComponentName + '.cellWidth',
    'cell-content-height': ComponentName + '.cellContentHeight',
    // 'original-title': ComponentName + '.originalTitle',
    title: ComponentName + '.title',
    description: ComponentName + '.description',
    'media-url': ComponentName + '.url',
    'thumbnail-url': ComponentName + '.thumbnailUrl',
    'production-credit': ComponentName + '.productionCredit',
    rating: ComponentName + '.rating',
    categories: ComponentName + '.categories',
    runtime: ComponentName + '.runtime',
    // tags: ComponentName + '.tags',
    mediatype: ComponentName + '.mediatype',
    linktype: ComponentName + '.linktype',
    videoformat: ComponentName + '.videoformat',
    'link-enabled': ComponentName + '.linkEnabled'
  }
}

const ComponentSystem = {
  name: ComponentName,
  component: VideoDetailsComponent,
  primitive: VideoDetailsPrimitive
}

export default ComponentSystem
