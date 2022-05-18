import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'

type GridToolServiceStateType = {
  visibility: boolean
  gridHeight: number
}

const state = createState<GridToolServiceStateType>({
  visibility: true,
  gridHeight: 0
})

store.receptors.push((action: GridToolActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'GRID_TOOL_HEIGHT_CHANGED':
        return s.merge({ gridHeight: action.gridHeight })
      case 'GRID_TOOL_VISIBILITY_CHANGED':
        return s.merge({ visibility: action.visibility })
    }
  }, action.type)
})

export const accessGridToolState = () => state

export const useGridToolState = () => useState(state) as any as typeof state

//Service
export const GridToolService = {}

//Action
export const GridToolAction = {
  changeGridToolHeight: (gridHeight: number) => {
    return {
      type: 'GRID_TOOL_HEIGHT_CHANGED' as const,
      gridHeight
    }
  },
  changeGridToolVisibility: (visibility: boolean) => {
    return {
      type: 'GRID_TOOL_VISIBILITY_CHANGED' as const,
      visibility
    }
  }
}

export type GridToolActionType = ReturnType<typeof GridToolAction[keyof typeof GridToolAction]>
