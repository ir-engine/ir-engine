// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'

export const ComponentName = 'media-cell'

export interface MediaCellSystemData {
}
export interface MediaCellSystemProps {
  getSource: (m:any) => string
}
export const MediaCellSystemSchema: AFRAME.Schema<MediaCellSystemData> = {
}

export const MediaCellSystemDef: AFRAME.SystemDefinition<MediaCellSystemProps> = {
  schema: MediaCellSystemSchema,
  data: {
  } as MediaCellSystemData,

  init () {
  },

  play() {
  },

  pause() {
  },
  getSource(media:any): string {
    return media.thumbnailUrl && media.thumbnailUrl.length > 0 ? media.thumbnailUrl : '#placeholder'
  }
}

export interface MediaCellData {
  cellHeight?: number
  cellWidth?: number
  cellContentHeight?: number
  // TODO : media type
  originalTitle: string,
  title: string,
  description: string,
  url: string, // TODO: type for url's
  thumbnailUrl: string,
  productionCredit: string,
  rating: string,
  categories: string[],
  runtime: string,
  tags: string[],
  mediatype: string,
  linktype: string,
  videoformat: string
}

export const MediaCellComponentSchema: AFRAME.MultiPropertySchema<MediaCellData> = {
  cellHeight: { default: 0.6 },
  cellWidth: { default: 1 },
  cellContentHeight: { default: 0.5 },
  originalTitle: { default: '' },
  title: { default: '' },
  description: { default: '' },
  url: { default: '' }, // TODO: type for url's
  thumbnailUrl: { default: '' },
  productionCredit: { default: '' },
  rating: { default: '' },
  categories: { default: [] },
  runtime: { default: '' },
  tags: { default: [] },
  mediatype: { default: 'video360' },
  linktype: { default: 'internal' },
  videoformat: { default: 'eac' }

}

export interface MediaCellProps {
  initCell: () => void,
  createCell: () => AFRAME.Entity,
}

export const MediaCellComponent: AFRAME.ComponentDefinition<MediaCellProps> = {
  schema: MediaCellComponentSchema,
  data: {
  } as MediaCellData,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initCell()
    else this.el.sceneEl?.addEventListener('loaded', this.initCell.bind(this))
  },

  play() {
  },

  pause() {
  },

  initCell() {
    this.el.appendChild(this.createCell())
  },

  createCell() {
    const imageEl = document.createElement('a-image')
    imageEl.classList.add('clickable')
    const source = (this.system as AFRAME.SystemDefinition<MediaCellSystemProps>).getSource(this.data)
    imageEl.setAttribute('src', source)
    imageEl.setAttribute('width', this.data.cellWidth)
    imageEl.setAttribute('height', this.data.cellContentHeight)

    let url: string
    switch (this.data.linktype) {
      case 'external':
        url = 'https://'
        break
      case 'internal':
      default:
        url = ''
        break
    }
    switch (this.data.mediatype) {
      case 'video360':
        url += 'video360?manifest=' + this.data.url +
          '&title=' + this.data.title +
          // '&runtime=' + this.data.runtime +
          // '&credit=' + this.data.productionCredit +
          // '&rating=' + this.data.rating +
          // '&categories=' + this.data.categories.join(',') +
          // '&tags=' + this.data.tags.join(',') +
          '&videoformat=' + this.data.videoformat
        break
      case 'scene':
        url += 'dreamscene?url=' + this.data.url
        break
      case 'landing':
        url += this.data.url
        break
      default:
        url += ''
        break
    }
    imageEl.addEventListener('click', () => {
      window.location.href = url
    })

    return imageEl
  }
}

export const MediaCellPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {},
    'grid-cell': {}
  },
  deprecated: false,
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
    // 'production-credit': ComponentName + '.productionCredit',
    // rating: ComponentName + '.rating',
    // categories: ComponentName + '.categories',
    // runtime: ComponentName + '.runtime',
    // tags: ComponentName + '.tags',
    mediatype: ComponentName + '.mediatype',
    linktype: ComponentName + '.linktype',
    videoformat: ComponentName + '.videoformat'
  }
}

const ComponentSystem = {
  name: ComponentName,
  system: MediaCellSystemDef,
  component: MediaCellComponent,
  primitive: MediaCellPrimitive
}

export default ComponentSystem
