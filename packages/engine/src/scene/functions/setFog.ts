import { Fog, FogExp2 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { FogComponent } from '../components/FogComponent'
import { FogType } from '../constants/FogType'

export const setFog = (
  entity,
  options: { type: string; color: string; density: number; near: number; far: number }
) => {
  if (options.type === FogType.Disabled) {
    return
  }

  let fog
  if (options.type === FogType.Linear) fog = new Fog(options.color, options.near, options.far)
  else if (options.type === FogType.Exponential) {
    fog = new FogExp2(options.color, options.density)
  }
  // else return console.warn("Fog is disabled");

  addComponent(entity, FogComponent, {
    type: options.type,
    color: options.color,
    density: options.density,
    near: options.near,
    far: options.far
  })

  Engine.scene.fog = fog
}
