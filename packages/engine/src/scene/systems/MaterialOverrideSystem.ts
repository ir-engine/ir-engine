import { Material, Mesh } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { assignMaterial, MaterialParms } from '../../renderer/materials/MaterialParms'
import UpdateableObject3D from '../classes/UpdateableObject3D'
import { MaterialOverrideComponent, MaterialOverrideComponentType } from '../components/MaterialOverrideComponent'
import { ModelComponent } from '../components/ModelComponent'
import { Object3DComponent, Object3DWithEntity } from '../components/Object3DComponent'

export type MatRend = {
  mesh: Mesh
  material: Material | Material[]
}

export type OverrideEntry = {
  defaults: MatRend[]
  matParm: MaterialParms
}

type EntityEntry = Map<MaterialOverrideComponentType, OverrideEntry>

export default async function MaterialOverrideSystem(world: World) {
  const overrideQuery = defineQuery([MaterialOverrideComponent])

  const overrideTable: Map<Entity, EntityEntry> = new Map()

  async function register(override: MaterialOverrideComponentType) {
    const [defaults, matParm] = await assignMaterial(override)
    if (defaults.length > 0) {
      const target = override.targetEntity
      if (!overrideTable.has(target)) overrideTable.set(target, new Map())
      const tableEntry = overrideTable.get(target)!
      tableEntry.set(override, { matParm, defaults })
    }
  }

  async function remove(override: MaterialOverrideComponentType) {
    const entEntry = overrideTable.get(override.targetEntity)!
    const tableEntry = entEntry.get(override)!
    for (const matRend of tableEntry.defaults) {
      matRend.mesh.material = matRend.material
    }
    entEntry.delete(override)
  }

  return async () => {
    await Promise.all(
      overrideQuery.enter().map(async (entity) => {
        const override = getComponent(entity, MaterialOverrideComponent)
        return register(override)
      })
    )

    await Promise.all(
      overrideQuery.exit().map(async (entity) => {
        const override = getComponent(entity, MaterialOverrideComponent, true)
        return remove(override)
      })
    )

    await Promise.all(
      overrideQuery().map(async (entity) => {
        const override = getComponent(entity, MaterialOverrideComponent)
        const entityEntry = overrideTable.get(override.targetEntity)!
        for (const overrideEntry of entityEntry.values()) {
          overrideEntry.matParm.update(world.fixedDeltaSeconds / 4)
        }
      })
    )
  }
}
