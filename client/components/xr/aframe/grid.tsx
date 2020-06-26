/* eslint-disable @typescript-eslint/consistent-type-assertions */
import AFRAME from 'aframe'
import { Grid } from '../../../classes/aframe/layout/GridUtils'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CylindricalGrid, Cylinder } from '../../../classes/aframe/layout/Cylinder'
import { Rectangle } from '../../../classes/aframe/layout/Rectangle'
import PropertyMapper from './ComponentUtils'

import { RoundedCornersPlaneGeometry } from '../three/RoundedCornersPlaneGeometry'

const THREE = AFRAME.THREE

export const ComponentName = 'grid'

export interface GridSystemData {
}
export interface GridSystemProps {
  gridRotation: (x: number, c: number) => number
  gridOffsetY: (r: number, h: number) => number
  gridOffsetZ: (r: number) => number
  getSource: (m: any) => string
  gridRotationObj: (gridCellsPerRow: number, c: number) => {x: number, y: number, z: number}
  gridOffsetObj: (radius: number, rows: number, cellHeight: number) => {x: number, y: number, z: number}
  updateLayout: (g: any, c: AFRAME.Entity[], s: number, e: number) => void
}
export const GridSystemSchema: AFRAME.Schema<GridSystemData> = {
}

export const GridSystemDef: AFRAME.SystemDefinition<GridSystemProps> = {
  schema: GridSystemSchema,
  data: {
  } as GridSystemData,

  init () {
  },

  play () {
  },

  pause () {
  },

  gridRotation (gridCellsPerRow: number, columns: number) {
    return (columns === 1) ? Math.PI : Math.PI - (Math.PI * 2 / gridCellsPerRow) * 2
  },

  gridOffsetY (rows: number, cellHeight: number) { return (1 - (rows / 2)) * cellHeight },

  gridOffsetZ (radius: number) { return radius },

  getSource (media: any): string {
    return media.thumbnail_url && media.thumbnail_url.length > 0 ? media.thumbnail_url : '#placeholder'
  },

  gridRotationObj (gridCellsPerRow: number, columns: number): {x: number, y: number, z: number} {
    return { x: 0, y: this.gridRotation(gridCellsPerRow, columns), z: 0 }
  },

  gridOffsetObj (radius: number, rows: number, cellHeight: number): {x: number, y: number, z: number} {
    return { x: 0, y: this.gridOffsetY(rows, cellHeight), z: this.gridOffsetZ(radius) }
  },

  updateLayout (gridShape: any, children: AFRAME.Entity[], pageStart: number, pageEnd: number) {
    children.forEach((cell: AFRAME.Entity, i: number) => {
      const cellActive = (i >= pageStart && i < pageEnd)
      cell.setAttribute('media-cell', { active: cellActive })
      const gridIndex = i - pageStart
      const pos: THREE.Vector3 = gridShape.cellPosition(gridIndex)
      cell.object3D.position.set(pos.x, pos.y, pos.z)
      const rot: THREE.Vector3 = gridShape.cellRotation(gridIndex)
      cell.object3D.rotation.set(rot.x, rot.y, rot.z)
    })
  }
}

export interface GridData {
  [key: string]: any
  gridCellsPerRow?: number
  cellHeight?: number
  radius?: number
  rows?: number
  columns?: number
  cellWidth?: number
  page?: number
  pageLeftEvent?: string
  pageRightEvent?: string
  gridShape?: string
  backGround?: boolean
  backgroundColor?: number
  backgroundMargin?: number
  borderRadius?: number
  // TODO : media type
}

export const GridComponentSchema: AFRAME.MultiPropertySchema<GridData> = {
  gridCellsPerRow: { default: 28 },
  cellHeight: { default: 0.6 },
  radius: { default: 6 },
  rows: { default: 3 },
  columns: { default: 5 },
  cellWidth: { default: 1 },
  page: { default: 0 },
  pageLeftEvent: { default: 'pageleft' },
  pageRightEvent: { default: 'pageright' },
  gridShape: { default: 'rectangle' },
  backGround: { default: false },
  backgroundColor: { default: 0x222222 },
  backgroundMargin: { default: 0.15 },
  borderRadius: { default: 0.1 }
}

export interface GridProps {
  initGrid: () => void
  cylinder: Cylinder
  grid: Grid
  cellsPerPage: number
  totalCells: number
  pages: number
  updateLayout: () => void
  updateChildren: () => void
  children: AFRAME.Entity[]
  addPaginators: () => void
  createPaginator: (side: string) => AFRAME.Entity
  updatePaginators: () => void
  pageLeftHandler: () => void
  pageRightHandler: () => void
  canPageLeft: boolean
  canPageRight: boolean
  addHandlers: () => void
  removeHandlers: () => void
  addBackground: () => void
}

export const GridComponent: AFRAME.ComponentDefinition<GridProps> = {
  schema: GridComponentSchema,
  data: {
  } as GridData,

  cylinder: {} as Cylinder,
  grid: {} as Grid,
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

    switch (this.data.gridShape) {
      case 'rectangle':
        this.grid = new Rectangle(
          this.data.cellHeight,
          this.data.cellWidth,
          this.data.rows,
          this.data.columns)
        break
      case 'cylinder':
        this.grid = new CylindricalGrid(
          this.data.cellsPerRow,
          this.data.cellHeight,
          this.data.cellWidth,
          this.data.radius,
          this.data.rows,
          this.data.columns)
        break
    }
    if (this.el.sceneEl?.hasLoaded) this.initGrid()
    else this.el.sceneEl?.addEventListener('loaded', this.initGrid.bind(this))
  },

  play () {
    this.addHandlers()
  },

  pause () {
    this.removeHandlers()
  },

  update (oldData: GridData) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('page')) {
      this.updateLayout()
      this.updatePaginators()
    }
  },
  initGrid () {
    this.el.classList.add('grid')
    if (this.data.gridShape === 'cylinder') {
      const rotObj = (this.system as AFRAME.SystemDefinition<GridSystemProps>).gridRotationObj(this.data.gridCellsPerRow,
        this.data.columns)
      this.el.object3D.rotation.set(rotObj.x, rotObj.y, rotObj.z)

      const posObj = (this.system as AFRAME.SystemDefinition<GridSystemProps>).gridOffsetObj(
        this.data.radius,
        this.data.rows,
        this.data.cellHeight)
      this.el.object3D.position.set(posObj.x, posObj.y, posObj.z)
    }

    if (this.data.backGround && this.data.gridShape === 'rectangle') {
      this.addBackground()
    }

    this.el.addEventListener('grid-cell-init', () => {
      this.updateLayout()
    })
    this.updateLayout()

    this.addPaginators()
    this.updatePaginators()
  },

  updateLayout () {
    this.updateChildren()

    if (this.system) {
      (this.system as AFRAME.SystemDefinition<GridSystemProps>).updateLayout(
        this.grid,
        this.children,
        this.data.page * this.cellsPerPage,
        (this.data.page as number + 1) * this.cellsPerPage
      )
    }
  },

  updateChildren () {
    this.children = ((this.el as AFRAME.Entity) as any).getChildEntities().filter(
      // eslint-disable-next-line no-prototype-builtins
      (el: AFRAME.Entity) => { return el.components.hasOwnProperty('grid-cell') })
    this.totalCells = this.children.length
    this.pages = Math.ceil(this.totalCells / this.cellsPerPage)
  },

  updatePaginators () {
    const leftDisabled = this.data.page === 0
    const rightDisabled = (this.data.page as number + 1) * this.cellsPerPage >= this.totalCells

    const leftPaginator = this.el.querySelector('.left-paginator')
    const rightPaginator = this.el.querySelector('.right-paginator')

    leftPaginator?.setAttribute('highlight', { disabled: leftDisabled })
    rightPaginator?.setAttribute('highlight', { disabled: rightDisabled })
  },

  createPaginator (side: string) {
    const paginatorEl = document.createElement('a-arrow')
    // paginatorEl.classList.add(side + '-paginator')
    // const paginatorWidth = this.data.contentHeight * this.data.rows
    // paginatorEl.setAttribute('direction', side)
    // paginatorEl.setAttribute('width', paginatorWidth)
    // paginatorEl.setAttribute('height', paginatorWidth * 4 / 7)
    // paginatorEl.setAttribute('ellipses', true)

    // paginatorEl.setAttribute('clickable', { clickevent: 'page' + side })
    // paginatorEl.setAttribute('highlight', {
    //   type: 'color',
    //   borderbaseopacity: 0.7,
    //   disabledopacity: 0,
    //   color: 0xe8f1ff,
    //   meshes: ['mesh', 'ellipse1', 'ellipse2', 'ellipse3']
    // })

    // const col = side === 'left' ? this.data.columns : 0
    // const xOffset: number = side === 'left' ? this.data.contentHeight / 2 : -this.data.contentHeight / 2
    // const pos: THREE.Vector3 = this.cylinder.cellPosition(col, 1)
    // paginatorEl.object3D.position.set(pos.x + xOffset * 2, pos.y, pos.z)
    // const rot: THREE.Vector3 = this.cylinder.cellRotation(col, false)
    // paginatorEl.object3D.rotation.set(rot.x, rot.y + Math.PI, rot.z)

    return paginatorEl
  },

  addPaginators () {
    const pageLeftEl = this.createPaginator('left')
    this.el.appendChild(pageLeftEl)

    const pageRightEl = this.createPaginator('right')
    this.el.appendChild(pageRightEl)
  },

  pageLeftHandler () {
    if (this.data.page > 0) {
      this.el.setAttribute('page', this.data.page - 1)
    }
  },

  pageRightHandler () {
    if (this.data.page < this.pages) {
      this.el.setAttribute('page', this.data.page as number + 1)
    }
  },

  addHandlers: function () {
    this.el.addEventListener(this.data.pageLeftEvent, this.pageLeftHandler.bind(this))
    this.el.addEventListener(this.data.pageRightEvent, this.pageRightHandler.bind(this))
  },

  removeHandlers: function () {
    this.el.removeEventListener(this.data.pageLeftEvent, this.pageLeftHandler)
    this.el.removeEventListener(this.data.pageRightEvent, this.pageRightHandler)
  },

  addBackground: function () {
    const width: number = this.grid.width
    const height: number = this.grid.height
    const radius: number = this.data.borderRadius

    const geo = new RoundedCornersPlaneGeometry(
      width + (this.data.backgroundMargin as number),
      height + (this.data.backgroundMargin as number),
      radius,
      10
    )

    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.data.backgroundColor)
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.z = -0.005

    this.el.setObject3D('background', mesh)
  }

}

const primitiveProperties = ['id', 'gridCellsPerRow', 'radius', 'columns', 'rows',
  'cellHeight', 'cellWidth', 'page', 'gridShape', 'backGround',
  'backgroundColor', 'backgroundMargin', 'borderRadius']

export const GridPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: PropertyMapper(primitiveProperties, ComponentName)
}

const ComponentSystem = {
  name: ComponentName,
  system: GridSystemDef,
  component: GridComponent,
  primitive: GridPrimitive
}

export default ComponentSystem
