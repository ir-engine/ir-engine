import { CircleBufferGeometry, Color, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { addObject3DComponent } from './addObject3DComponent'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { NavMeshBuilder } from '../../map/NavMeshBuilder'
import { computeBoundingBox, scaleAndTranslate } from '../../map/GeoJSONFns'
import { Polygon, MultiPolygon, Position } from 'geojson'
import { NavMesh } from 'yuka'
import pc from 'polygon-clipping'
import { fetchVectorTiles } from '../../map/MapBoxClient'
import { METERS_PER_DEGREE_LL } from '../../map/constants'
import { TileFeaturesByLayer } from '../../map/types'

type GroundProps = {
  color: string
}

export const createGround = async function (entity: Entity, args: GroundProps, isClient: boolean) {
  const mesh = new Mesh(
    new CircleBufferGeometry(1000, 32).rotateX(-Math.PI / 2),
    new MeshStandardMaterial({
      color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
      roughness: 0
    })
  )

  addObject3DComponent(entity, mesh, { receiveShadow: true, 'material.color': args.color })

  const body = createCollider(
    entity,
    {
      userData: {
        type: 'ground',
        collisionLayer: CollisionGroups.Ground,
        collisionMask: CollisionGroups.Default
      }
    },
    new Vector3().copy(mesh.position),
    new Quaternion().copy(mesh.quaternion),
    new Vector3().copy(mesh.scale)
  )

  if (isClient) {
    const center: Position = [mesh.position.x, mesh.position.y, mesh.position.z]
    const vectorTiles = await fetchVectorTiles(center)
    const navMesh = generateNavMesh(vectorTiles, center, mesh.scale.x * METERS_PER_DEGREE_LL)
    addComponent(entity, NavMeshComponent, { yukaNavMesh: navMesh, navTarget: mesh })
  }

  addComponent(entity, ColliderComponent, { body })
}

const generateNavMesh = function (tiles: TileFeaturesByLayer[], center: Position, scale: number): NavMesh {
  const builder = new NavMeshBuilder()
  const gBuildings = tiles
    .reduce((acc, tiles) => acc.concat(tiles.building), [])
    .map((feature) => {
      return scaleAndTranslate(feature.geometry as Polygon | MultiPolygon, center, scale)
    })

  const gGround = computeBoundingBox(gBuildings)
  let gBuildingNegativeSpace = [gGround.coordinates]
  gBuildings.forEach((gPositiveSpace) => {
    gBuildingNegativeSpace = pc.difference(gBuildingNegativeSpace as any, gPositiveSpace.coordinates as any)
  })
  builder.addGeometry({ type: 'MultiPolygon', coordinates: gBuildingNegativeSpace })
  return builder.build()
}
