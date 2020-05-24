import AFRAME from 'aframe'

export const ComponentName = 'grid-cell'

export interface GridCellData {
  isGridCell: boolean,
  active: boolean
}

export const GridCellComponentSchema: AFRAME.MultiPropertySchema<GridCellData> = {
  isGridCell: { default: true },
  active: { default: true }
}

export const GridCellComponent: AFRAME.ComponentDefinition = {
  schema: GridCellComponentSchema,
  data: {
  } as GridCellData,

  play() {
  },

  pause() {
  }
}

export const GridCellPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    id: ComponentName + '.id'
  }
}

const ComponentSystem = {
  name: ComponentName,
  component: GridCellComponent,
  primitive: GridCellPrimitive
}

export default ComponentSystem
