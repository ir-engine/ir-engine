// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'
import { CylindricalGrid } from '../../../classes/aframe/layout/GridUtils'

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
  updateLayout:(g: any, c: AFRAME.Entity[]) => void
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

  updateLayout(gridShape: any, children: AFRAME.Entity[]) {
    children.forEach((cell: AFRAME.Entity, i: number) => {
      const pos = gridShape.cellPosition(i)
      cell.object3D.position.set(pos.x, pos.y, pos.z)
      const rot = gridShape.cellRotation(i)
      cell.object3D.rotation.set(rot.x, rot.y + Math.PI, rot.z)
    })
  }
}

export interface GridData {
  gridCellsPerRow?: number
  cellHeight?: number
  radius?: number
  rows?: number
  columns?: number
  cellWidth?: number
  cellContentHeight?: number
  // TODO : media type
}

export const GridComponentSchema: AFRAME.MultiPropertySchema<GridData> = {
  gridCellsPerRow: { default: 28 },
  cellHeight: { default: 0.6 },
  radius: { default: 6 },
  rows: { default: 3 },
  columns: { default: 5 },
  cellWidth: { default: 1 },
  cellContentHeight: { default: 0.5 }
}

export interface GridProps {
  initGrid: () => void,
  cylindricalGrid: CylindricalGrid,
  updateChildren: () => void,
  children: AFRAME.Entity[]
}

export const GridComponent: AFRAME.ComponentDefinition<GridProps> = {
  schema: GridComponentSchema,
  data: {
  } as GridData,

  cylindricalGrid: {} as CylindricalGrid,
  children: [] as AFRAME.Entity[],

  init () {
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
  },

  pause() {
  },

  // update(oldData) {
  // if (this.data['needsupdate']) {
  //     this.updateChildren();
  //     if (this.system) {
  //       (this.system as AFRAME.SystemDefinition<GridSystemProps>).updateLayout(this.cylindricalGrid, this.children)
  //     }
  //     this.el.setAttribute('grid', {'needsupdate': false});
  // }
  // },

  initGrid() {
    this.el.classList.add('grid-cylinder')
    const rotObj = (this.system as AFRAME.SystemDefinition<GridSystemProps>).gridRotationObj(this.data.gridCellsPerRow,
      this.data.columns)
    this.el.object3D.rotation.set(rotObj.x, rotObj.y, rotObj.z)
    const posObj = (this.system as AFRAME.SystemDefinition<GridSystemProps>).gridOffsetObj(this.data.rows,
      this.data.cellHeight)
    this.el.object3D.position.set(posObj.x, posObj.y, posObj.z)

    this.updateChildren()

    if (this.system) {
      (this.system as AFRAME.SystemDefinition<GridSystemProps>).updateLayout(this.cylindricalGrid, this.children)
    }
  },

  updateChildren() {
    // @ts-ignore
    this.children = (this.el as AFRAME.Entity).getChildEntities().filter(
      // eslint-disable-next-line no-prototype-builtins
      (el: AFRAME.Entity) => { return el.components.hasOwnProperty('grid-cell') })
  }

  // gridItemAppendedHandler(evt) {
  //   this.system.updateLayout(this.data, this.children);
  // }

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
    'cell-content-height': ComponentName + '.cellContentHeight'
  }
}

const ComponentSystem = {
  name: ComponentName,
  system: GridSystemDef,
  component: GridComponent,
  primitive: GridPrimitive
}

export default ComponentSystem
