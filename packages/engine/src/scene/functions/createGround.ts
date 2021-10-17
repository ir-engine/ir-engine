import { Mesh, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { NavMeshBuilder } from '../../map/NavMeshBuilder'
import { computeBoundingBox, scaleAndTranslate } from '../../map/GeoJSONFns'
import { Polygon, MultiPolygon, Position } from 'geojson'
import { NavMesh } from 'yuka'
import pc from 'polygon-clipping'
import { fetchVectorTiles } from '../../map/MapBoxClient'
import { METERS_PER_DEGREE_LL } from '../../map/constants'
import { TileFeaturesByLayer } from '../../map/types'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { GroundPlaneComponent, GroundPlaneData } from '../components/GroundPlaneComponent'

type GroundProps = {
  color: string
}

const halfTurnX = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export const createGround = async function (entity: Entity, args: any, isClient: boolean): Promise<Mesh> {
  const object3DComponent = getComponent(entity, Object3DComponent)

  addComponent<GroundPlaneData, {}>(
    entity,
    GroundPlaneComponent,
    new GroundPlaneData(object3DComponent.value as Mesh, args)
  )

  getComponent(entity, TransformComponent).rotation.multiply(halfTurnX)

  const mesh = object3DComponent.value as Mesh

  createCollider(entity, mesh)

  if (isClient) {
    const center: Position = [mesh.position.x, mesh.position.y, mesh.position.z]
    const vectorTiles = await fetchVectorTiles(center)
    const navMesh = generateNavMesh(vectorTiles, center, mesh.scale.x * METERS_PER_DEGREE_LL)
    addComponent(entity, NavMeshComponent, { yukaNavMesh: navMesh, navTarget: mesh })
  }

  return mesh
}

const generateNavMesh = function (tiles: TileFeaturesByLayer[], center: Position, scale: number): NavMesh {
  const builder = new NavMeshBuilder()
  const gBuildings = tiles
    .reduce((acc, tiles) => acc.concat(tiles.building as any), [])
    .map((feature: any) => {
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
