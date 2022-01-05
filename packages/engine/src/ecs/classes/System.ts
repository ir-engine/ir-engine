import { World } from './World'

export type System = (() => void) | ((world: World) => World)
