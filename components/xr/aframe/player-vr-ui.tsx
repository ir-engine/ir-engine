import AFRAME from 'aframe'
// const THREE = AFRAME.THREE

export const ComponentName = 'player-vr-ui'

export interface PlayerVrUiComponentProps {
}

export interface PlayerVrUiComponentData {
}

export const PlayerVrUiComponentSchema: AFRAME.MultiPropertySchema<PlayerVrUiComponentData> = {
}

export const PlayerVrUiComponent: AFRAME.ComponentDefinition<PlayerVrUiComponentProps> = {
  schema: PlayerVrUiComponentSchema,
  data: {
  } as PlayerVrUiComponentData,

  init() {
    console.log('PlayerVrUiComponent init')
  },

  update() {
  }
}

const ComponentSystem = {
  name: ComponentName,
  component: PlayerVrUiComponent
}

export default ComponentSystem
