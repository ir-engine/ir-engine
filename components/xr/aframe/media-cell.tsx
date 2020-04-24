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
  link: string, // TODO: type for url's
  thumbnailUrl: string,
  productionCredit: string,
  rating: string,
  categories: string[],
  runtime: string,
  tags: string[],
  mediatype: string
}

export const MediaCellComponentSchema: AFRAME.MultiPropertySchema<MediaCellData> = {
  cellHeight: { default: 0.6 },
  cellWidth: { default: 1 },
  cellContentHeight: { default: 0.5 },
  originalTitle: { default: '' },
  title: { default: '' },
  description: { default: '' },
  link: { default: '' }, // TODO: type for url's
  thumbnailUrl: { default: '' },
  productionCredit: { default: '' },
  rating: { default: '' },
  categories: { default: [] },
  runtime: { default: '' },
  tags: { default: [] },
  mediatype: { default: 'video360' }
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

    let link: string
    switch (this.data.mediatype) {
      case 'video360':
        link = 'video360?manifest=' + this.data.link + '&title=' + this.data.title
        break
      case 'scene':
        link = this.data.link
        break
      default:
        link = ''
        break
    }
    imageEl.addEventListener('click', () => {
      window.location.href = link
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
    'original-title': ComponentName + '.originalTitle',
    title: ComponentName + '.title',
    description: ComponentName + '.description',
    'media-link': ComponentName + '.link',
    'thumbnail-url': ComponentName + '.thumbnailUrl',
    'production-credit': ComponentName + '.productionCredit',
    rating: ComponentName + '.rating',
    categories: ComponentName + '.categories',
    runtime: ComponentName + '.runtime',
    tags: ComponentName + '.tags',
    mediatype: ComponentName + '.mediatype'
  }
}

const ComponentSystem = {
  name: ComponentName,
  system: MediaCellSystemDef,
  component: MediaCellComponent,
  primitive: MediaCellPrimitive
}

export default ComponentSystem
