import { World } from './World'

export type System = (world: World, ...args: any[]) => void
