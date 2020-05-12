import AFRAME from 'aframe'
import { CylindricalGrid, Cylinder } from '../../../classes/aframe/layout/GridUtils'

export const ComponentName = 'grid'

export interface GridSystemData {
}
export interface GridSystemProps {
  gridRotation: (x: number, c: number) => number,
  gridOffsetY: (r: number, h: number) => number,
  getSource: (m:any) => string,
  gridRotationString:(gridCellsPerRow: number, c: number) => string,
  gridRotationObj:(gridCellsPerRow: number, c: number) => {x: number, y: number, z: number},
  gridOffsetString:(rows: number, cellHeight: number) => string
  gridOffsetObj:(rows: number, cellHeight: number) => {x: number, y: number, z: number},
  updateLayout:(g: any, c: AFRAME.Entity[], s: number, e: number) => void
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

  gridRotation(gridCellsPerRow: number, columns: number) {
    return (columns === 1) ? Math.PI : Math.PI - (Math.PI * 2 / (gridCellsPerRow ?? gridCellsPerRow)) * 2
  },

  gridOffsetY(rows: number, cellHeight: number) { return (1 - (rows ?? rows) / 2) * (cellHeight ?? cellHeight) },

  getSource(media:any): string {
    return media.thumbnail_url && media.thumbnail_url.length > 0 ? media.thumbnail_url : '#placeholder'
  },

  gridRotationString(gridCellsPerRow: number, columns: number): string {
    return '0 ' + this.gridRotation(gridCellsPerRow, columns) + ' 0'
  },

  gridRotationObj(gridCellsPerRow: number, columns: number): {x: number, y: number, z: number} {
    return { x: 0, y: this.gridRotation(gridCellsPerRow, columns), z: 0 }
  },

  gridOffsetString(rows: number, cellHeight: number): string {
    return '0 ' + this.gridOffsetY(rows, cellHeight) + ' 0'
  },

  gridOffsetObj(rows: number, cellHeight: number): {x: number, y: number, z: number} {
    return { x: 0, y: this.gridOffsetY(rows, cellHeight), z: 0 }
  },

  updateLayout(gridShape: any, children: AFRAME.Entity[], pageStart: number, pageEnd: number) {
    children.forEach((cell: AFRAME.Entity, i: number) => {
      const cellActive = (i >= pageStart && i < pageEnd)
      cell.setAttribute('media-cell', { active: cellActive })
      const gridIndex = i - pageStart
      const pos = gridShape.cellPosition(gridIndex)
      cell.object3D.position.set(pos.x, pos.y, pos.z)
      const rot = gridShape.cellRotation(gridIndex)
      cell.object3D.rotation.set(rot.x, rot.y + Math.PI, rot.z)
    })
  }
}

export interface GridData {
  [key: string]: any,
  gridCellsPerRow?: number,
  cellHeight?: number,
  radius?: number,
  rows?: number,
  columns?: number,
  cellWidth?: number,
  cellContentHeight?: number,
  page?: number,
  pageLeftEvent?: string,
  pageRightEvent?: string,
  // TODO : media type
}

export const GridComponentSchema: AFRAME.MultiPropertySchema<GridData> = {
  gridCellsPerRow: { default: 28 },
  cellHeight: { default: 0.6 },
  radius: { default: 6 },
  rows: { default: 3 },
  columns: { default: 5 },
  cellWidth: { default: 1 },
  cellContentHeight: { default: 0.5 },
  page: { default: 0 },
  pageLeftEvent: { default: 'pageleft' },
  pageRightEvent: { default: 'pageright' }
}

export interface GridProps {
  initGrid: () => void,
  cylinder: Cylinder,
  cylindricalGrid: CylindricalGrid,
  cellsPerPage: number,
  totalCells: number,
  pages: number,
  updateLayout: () => void,
  updateChildren: () => void,
  children: AFRAME.Entity[],
  addPaginators: () => void,
  createPaginator: (side: string) => AFRAME.Entity,
  updatePaginators: () => void,
  pageLeftHandler: () => void,
  pageRightHandler: () => void,
  canPageLeft: boolean,
  canPageRight: boolean,
  addHandlers: () => void,
  removeHandlers: () => void
}

export const GridComponent: AFRAME.ComponentDefinition<GridProps> = {
  schema: GridComponentSchema,
  data: {
  } as GridData,

  cylinder: {} as Cylinder,
  cylindricalGrid: {} as CylindricalGrid,
  cellsPerPage: 0,
  totalCells: 0,
  pages: 0,
  children: [] as AFRAME.Entity[],
  canPageLeft: false,
  canPageRight: false,

  init () {
    this.cellsPerPage = this.data.rows * this.data.columns
    this.cylinder = new Cylinder(this.data.cellsPerRow,
      this.data.cellHeight,
      this.data.cellWidth,
      this.data.radius)
    this.cylindricalGrid = new CylindricalGrid(this.data.cellsPerRow,
      this.data.cellHeight,
      this.data.cellWidth,
      this.data.radius,
      this.data.rows,
      this.data.columns)
    if (this.el.sceneEl?.hasLoaded) this.initGrid()
    else this.el.sceneEl?.addEventListener('loaded', this.initGrid.bind(this))
  },

  play() {
    this.addHandlers()
  },

  pause() {
    this.removeHandlers()
  },

  update(oldData: GridData) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('page')) {
      this.updateLayout()
      this.updatePaginators()
    }
  },
  initGrid() {
    this.el.classList.add('grid-cylinder')
    const rotObj = (this.system as AFRAME.SystemDefinition<GridSystemProps>).gridRotationObj(this.data.gridCellsPerRow,
      this.data.columns)
    this.el.object3D.rotation.set(rotObj.x, rotObj.y, rotObj.z)
    const posObj = (this.system as AFRAME.SystemDefinition<GridSystemProps>).gridOffsetObj(this.data.rows,
      this.data.cellHeight)
    this.el.object3D.position.set(posObj.x, posObj.y, posObj.z)

    this.updateLayout()

    this.addPaginators()
    this.updatePaginators()
  },

  updateLayout() {
    this.updateChildren()

    if (this.system) {
      (this.system as AFRAME.SystemDefinition<GridSystemProps>).updateLayout(
        this.cylindricalGrid,
        this.children,
        this.data.page * this.cellsPerPage,
        (this.data.page + 1) * this.cellsPerPage
      )
    }
  },

  updateChildren() {
    // @ts-ignore
    this.children = (this.el as AFRAME.Entity).getChildEntities().filter(
      // eslint-disable-next-line no-prototype-builtins
      (el: AFRAME.Entity) => { return el.components.hasOwnProperty('grid-cell') })
    this.totalCells = this.children.length
    this.pages = Math.ceil(this.totalCells / this.cellsPerPage)
  },

  // gridItemAppendedHandler(evt) {
  //   this.system.updateLayout(this.data, this.children);
  // }
  updatePaginators() {
    const leftDisabled = this.data.page === 0
    const rightDisabled = (this.data.page + 1) * this.cellsPerPage >= this.totalCells

    const leftPaginator = this.el.querySelector('.left-paginator')
    const rightPaginator = this.el.querySelector('.right-paginator')

    leftPaginator?.setAttribute('highlight', { disabled: leftDisabled })
    rightPaginator?.setAttribute('highlight', { disabled: rightDisabled })
  },

  createPaginator (side: string) {
    const paginatorEl = document.createElement('a-arrow')
    paginatorEl.classList.add(side + '-paginator')
    paginatorEl.setAttribute('direction', side)
    paginatorEl.setAttribute('width', 0.35)
    paginatorEl.setAttribute('height', 0.2)

    paginatorEl.setAttribute('clickable', { clickevent: 'page' + side })
    paginatorEl.setAttribute('highlight', {
      type: 'color',
      borderbaseopacity: 0.7,
      disabledopacity: 0.2,
      color: 0xe8f1ff
    })

    const col = side === 'left' ? this.data.columns : 0
    const pos = this.cylinder.cellPosition(col, 0)
    paginatorEl.object3D.position.set(pos.x - 0.1525, pos.y, pos.z)
    const rot = this.cylinder.cellRotation(col, false)
    paginatorEl.object3D.rotation.set(rot.x, rot.y + Math.PI, rot.z)

    return paginatorEl
  },

  addPaginators() {
    const pageLeftEl = this.createPaginator('left')
    this.el.appendChild(pageLeftEl)

    const pageRightEl = this.createPaginator('right')
    this.el.appendChild(pageRightEl)
  },

  pageLeftHandler() {
    if (this.data.page > 0) {
      this.el.setAttribute('page', this.data.page - 1)
    }
  },

  pageRightHandler() {
    if (this.data.page < this.pages) {
      this.el.setAttribute('page', this.data.page + 1)
    }
  },

  addHandlers: function() {
    this.el.addEventListener(this.data.pageLeftEvent, this.pageLeftHandler.bind(this))
    this.el.addEventListener(this.data.pageRightEvent, this.pageRightHandler.bind(this))
  },

  removeHandlers: function() {
    this.el.removeEventListener(this.data.pageLeftEvent, this.pageLeftHandler)
    this.el.removeEventListener(this.data.pageRightEvent, this.pageRightHandler)
  }

}

export const GridPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    id: ComponentName + '.id',
    'grid-cells-per-row': ComponentName + '.gridCellsPerRow',
    radius: ComponentName + '.radius',
    columns: ComponentName + '.columns',
    rows: ComponentName + '.rows',
    'cell-height': ComponentName + '.cellHeight',
    'cell-width': ComponentName + '.cellWidth',
    'cell-content-height': ComponentName + '.cellContentHeight',
    page: ComponentName + '.page'
  }
}

const ComponentSystem = {
  name: ComponentName,
  system: GridSystemDef,
  component: GridComponent,
  primitive: GridPrimitive
}

export default ComponentSystem
