import { CircleBufferGeometry, Color, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { addObject3DComponent } from './addObject3DComponent'
// import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
// import { NavMeshBuilder } from '../../map/NavMeshBuilder'
// import { computeBoundingBox, scaleAndTranslate } from '../../map/GeoJSONFns'
// import { Polygon, MultiPolygon, Position } from 'geojson'
// import { NavMesh } from 'yuka'
// import pc from 'polygon-clipping'
// import { fetchVectorTiles } from '../../map/MapBoxClient'
// import { METERS_PER_DEGREE_LL } from '../../map/constants'
// import { TileFeaturesByLayer } from '../../map/types'
import { TransformComponent } from '../../transform/components/TransformComponent'

type GroundProps = {
  color: string
}

const halfTurnX = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export const createGround = async function (entity: Entity, args: GroundProps, isClient: boolean): Promise<Mesh> {
  const mesh = new Mesh(
    new CircleBufferGeometry(1000, 32),
    new MeshStandardMaterial({
      color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
      roughness: 0
    })
  )

  getComponent(entity, TransformComponent).rotation.multiply(halfTurnX)

  addObject3DComponent(entity, mesh, { receiveShadow: true, 'material.color': args.color })

  mesh.userData = {
    type: 'ground',
    collisionLayer: CollisionGroups.Ground,
    collisionMask: CollisionGroups.Default
  }

  createCollider(entity, mesh)

  if (isClient) {
    // TODO should this be here???
    // const center: Position = [mesh.position.x, mesh.position.y, mesh.position.z]
    // const vectorTiles = await fetchVectorTiles(center)
    // const navMesh = generateNavMesh(vectorTiles, center, mesh.scale.x * METERS_PER_LONGLAT)
    // addComponent(entity, NavMeshComponent, { yukaNavMesh: navMesh, navTarget: mesh })
  }

  return mesh
}

// const generateNavMesh = function (tiles: TileFeaturesByLayer[], center: Position, scale: number): NavMesh {
//   const builder = new NavMeshBuilder()
//   const gBuildings = tiles
//     .reduce((acc, tiles) => acc.concat(tiles.building), [])
//     .map((feature) => {
//       return scaleAndTranslate(feature.geometry as Polygon | MultiPolygon, center, scale)
//     })

//   const gGround = computeBoundingBox(gBuildings)
//   let gBuildingNegativeSpace = [gGround.coordinates]
//   gBuildings.forEach((gPositiveSpace) => {
//     gBuildingNegativeSpace = pc.difference(gBuildingNegativeSpace as any, gPositiveSpace.coordinates as any)
//   })
//   builder.addGeometry({ type: 'MultiPolygon', coordinates: gBuildingNegativeSpace })
//   return builder.build()
// }
