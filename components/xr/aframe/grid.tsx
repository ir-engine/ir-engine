// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'
import { CylindricalGrid } from '../../../classes/aframe/layout/GridUtils'

export const ComponentName = 'grid'

export interface GridSystemData {
}
export interface GridSystemProps {
  gridRotation: (x: number) => number,
  gridOffsetY: (r: number, h: number) => number,
  getSource: (m:any) => string,
  gridRotationString:(gridCellsPerRow: number) => string,
  gridRotationObj:(gridCellsPerRow: number) => {x: number, y: number, z: number},
  gridOffsetString:(rows: number, cellHeight: number, playerHeight: number) => string
}
export const GridSystemSchema: AFRAME.Schema<GridSystemData> = {
}

export const GridSystemDef: AFRAME.SystemDefinition<GridSystemProps> = {
  schema: GridSystemSchema,
  data: {
  } as GridSystemData,

  init () {
  },

  play() {
  },

  pause() {
  },

  // TODO: gridRotation in radians, use it for gridRotationObj for setting rotaton on object3D's
  gridRotation(gridCellsPerRow: number) { return 180 - (360 / (gridCellsPerRow ?? gridCellsPerRow)) * 2 },

  gridOffsetY(rows: number, cellHeight: number) { return (1 - (rows ?? rows) / 2) * (cellHeight ?? cellHeight) },

  getSource(media:any): string {
    return media.thumbnail_url && media.thumbnail_url.length > 0 ? media.thumbnail_url : '#placeholder'
  },

  gridRotationString(gridCellsPerRow: number): string { return '0 ' + this.gridRotation(gridCellsPerRow) + ' 0' },

  gridRotationObj(gridCellsPerRow: number): {x: number, y: number, z: number} {
    return { x: 0, y: this.gridRotation(gridCellsPerRow), z: 0 }
  },

  gridOffsetString(rows: number, cellHeight: number, playerHeight: number): string {
    return '0 ' + (this.gridOffsetY(rows, cellHeight) + playerHeight) + ' 0'
  }
}

export interface GridData {
  linkPrefix?: string
  gridCellsPerRow?: number
  cellHeight?: number
  radius?: number
  rows?: number
  columns?: number
  media?: any[]
  cellWidth?: number
  cellContentHeight?: number
  // TODO : media type
}

export const GridComponentSchema: AFRAME.MultiPropertySchema<GridData> = {
  linkPrefix: '',
  gridCellsPerRow: 28,
  cellHeight: 0.6,
  radius: 6,
  rows: 3,
  columns: 5,
  media: [],
  cellWidth: 1,
  cellContentHeight: 0.5
}

export interface GridProps {
  el: AFRAME.Entity | null,
  firstUpdate: boolean,
  initGrid: () => void,
  createCell: (element: any, i: number) => AFRAME.Entity,
  cylindricalGrid: CylindricalGrid,
  gridCellRotation: (n: number) => string,
  gridCellPosition: (n: number) => string,
}

export const GridComponent: AFRAME.ComponentDefinition<GridProps> = {
  schema: GridComponentSchema,
  data: {
  } as GridData,

  el: {} as AFRAME.Entity,
  firstUpdate: true,
  cylindricalGrid: {} as CylindricalGrid,

  init () {
    this.cylindricalGrid = new CylindricalGrid(this.data.cellsPerRow,
      this.data.cellHeight,
      this.data.radius,
      this.data.rows,
      this.data.columns)
    if (this.el.sceneEl?.hasLoaded) this.initGrid()
    else this.el.sceneEl?.addEventListener('loaded', this.initGrid.bind(this))
  },

  play() {
  },

  pause() {
  },

  initGrid() {
    this.el.setAttribute('id', this.data.id)
    this.el.classList.add('grid-cylinder')
    const rotObj = (this.system as AFRAME.SystemDefinition<GridSystemProps>).gridRotationObj(this.data.gridCellsPerRow)
    this.el.object3D.rotation.set(rotObj.x, rotObj.y, rotObj.z)

    this.data.media.forEach((element: any, i: number) => {
      const cell: AFRAME.Entity = this.createCell(element, i)
      this.el.appendChild(cell)
    })
  },

  createCell(element: any, i: number): AFRAME.Entity {
    const el = document.createElement('a-entity')
    el.classList.add('clickable')
    const source = (this.system as AFRAME.SystemDefinition<GridSystemProps>).getSource(element)
    el.setAttribute('src', source)
    el.setAttribute('width', this.data.cellWidth)
    el.setAttribute('height', this.data.cellContentHeight)

    // TODO : add event listener for click to follow element.link
    return el
  },

  gridCellRotation(itemNum: number) {
    const rot = this.cylindricalGrid.cellRotation(itemNum)
    return `${rot.x} ${rot.y + 180} ${rot.z}`
  },

  gridCellPosition(itemNum: number) {
    const pos = this.cylindricalGrid.cellPosition(itemNum)
    return `${pos.x} ${pos.y} ${pos.z}`
  }

}

export const GridPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    id: ComponentName + '.id',
    linkPrefix: ComponentName + '.linkPrefix',
    gridCellsPerRow: ComponentName + '.gridCellsPerRow',
    cellHeight: ComponentName + '.cellHeight',
    radius: ComponentName + '.radius',
    columns: ComponentName + '.columns',
    rows: ComponentName + '.rows',
    media: ComponentName + '.media',
    cellWidth: ComponentName + '.cellWidth',
    cellContentHeight: ComponentName + '.cellContentHeight'

  }
}

const ComponentSystem = {
  name: ComponentName,
  system: GridSystemDef,
  component: GridComponent,
  primitive: GridPrimitive
}

export default ComponentSystem
