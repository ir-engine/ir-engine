import AFRAME from 'aframe'
// import store from '../../../redux/store'
// import { setAppLoaded } from '../../../redux/app/actions'
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
  [key: string]: any,
  active: boolean,
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
  videoformat: string,
  linkEnabled: boolean
}

export const MediaCellComponentSchema: AFRAME.MultiPropertySchema<MediaCellData> = {
  active: { default: true },
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
  videoformat: { default: 'eac' },
  linkEnabled: { default: true }
}

export interface MediaCellProps {
  initCell: () => void,
  initCellCB: () => void,
  createCell: () => AFRAME.Entity,
  enableLink: (el: any) => void
}

export const MediaCellComponent: AFRAME.ComponentDefinition<MediaCellProps> = {
  schema: MediaCellComponentSchema,
  data: {
  } as MediaCellData,

  init () {
    this.initCellCB()
  },

  play() {
  },

  pause() {
  },

  update(oldData: MediaCellData) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('active')) {
      this.el.setAttribute('grid-cell', { active: this.data.active })
      if (this.data.active) {
        this.initCellCB()
      } else {
        while (this.el.firstChild) {
          this.el.removeChild((this.el as any).lastChild)
        }
      }
    }
  },

  initCellCB () {
    if (this.el.sceneEl?.hasLoaded) this.initCell()
    else this.el.sceneEl?.addEventListener('loaded', this.initCell.bind(this))
  },

  initCell() {
    const active = (this.el.components['grid-cell'] as any).data.active
    if (active) this.el.appendChild(this.createCell())
  },

  createCell() {
    const imageEl = document.createElement('a-image')
    const source = (this.system as AFRAME.SystemDefinition<MediaCellSystemProps>).getSource(this.data)
    imageEl.setAttribute('src', source)
    imageEl.setAttribute('width', this.data.cellWidth)
    imageEl.setAttribute('height', this.data.cellContentHeight)
    imageEl.setAttribute('side', 'double')
    imageEl.classList.add('clickable')

    if (this.data.linkEnabled) this.enableLink(imageEl)

    return imageEl
  },

  enableLink(el: any) {
    el.classList.add('clickable')
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
          '&runtime=' + this.data.runtime +
          '&credit=' + this.data.productionCredit +
          '&rating=' + this.data.rating +
          '&categories=' + this.data.categories.join(',') +
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
    // handle navigate on the react side - this emits the 'navigate' event when .clickable is clicked
    // and passes the url data through
    el.setAttribute('clickable', { clickevent: 'navigate', clickeventData: JSON.stringify({ url }) })
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
    active: 'grid-cell.active',
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
  system: MediaCellSystemDef,
  component: MediaCellComponent,
  primitive: MediaCellPrimitive
}

export default ComponentSystem
