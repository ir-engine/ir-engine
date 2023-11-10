import { State, defineState } from '@etherealengine/hyperflux'
import { FogType } from './constants/FogType'

export const DefaultFogState = {
  type: FogType.Disabled as FogType,
  color: '#FFFFFF',
  density: 0.005,
  near: 1,
  far: 1000,
  timeScale: 1,
  height: 0.05
}

export type FogState = State<typeof DefaultFogState>

export const FogSettingState = defineState({
  name: 'FogSettingState',
  initial: DefaultFogState
})
