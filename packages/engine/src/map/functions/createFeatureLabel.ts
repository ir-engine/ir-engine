import { MapFeatureLabel, Text3D } from '../types'
import { Text } from 'troika-three-text'
import { Feature, LineString, Position } from 'geojson'
import { length, lineSliceAlong } from '@turf/turf'
import { Engine } from '../../ecs/classes/Engine'
import { Vector3 } from 'three'
import { LongLat, toMetersFromCenter } from '../units'

const DEFAULT_FONT_SIZE = 18
const WorldUp = new Vector3(0, 1, 0)

function normalizeAngle(angle: number) {
  return angle < 0 ? Math.PI * 2 + angle : angle
}

function createText(textString: string): Text3D {
  const object3d = new Text()

  object3d.text = textString
  object3d.fontSize = DEFAULT_FONT_SIZE
  object3d.color = 0x000000
  object3d.fillOpacity = 0.5
  object3d.anchorX = '50%'
  object3d.anchorY = '50%'
  object3d.opacity = 0.5

  object3d.scale.set(1, 1, 1)
  object3d.position.y = 0

  return object3d
}

const $cameraDirection = new Vector3()
function createUpdateClosure(mesh: Text3D, middleSlice: Position[]) {
  return function updateFeatureLabel() {
    const camera = Engine.camera
    const [[x1, y1], [x2, y2]] = middleSlice

    const angle = Math.atan2(y2 - y1, x2 - x1)

    camera.getWorldDirection($cameraDirection)

    const cameraAngle = normalizeAngle(Math.atan2($cameraDirection.x, $cameraDirection.z))
    const angleDiff = normalizeAngle(cameraAngle - angle)
    mesh.quaternion.setFromAxisAngle(
      WorldUp,
      angleDiff < Math.PI / 2 || angleDiff > (Math.PI * 3) / 2 ? angle + Math.PI : angle
    )
    mesh.rotateX(-Math.PI / 2)

    mesh.sync()
  }
}

export default function createFeatureLabel(feature: Feature<LineString>, center: LongLat): MapFeatureLabel {
  const featureLen = length(feature)
  const middleSlice = lineSliceAlong(feature, featureLen * 0.49, featureLen * 0.51).geometry.coordinates

  const [[x1, y1]] = middleSlice

  const mesh = createText(feature.properties.name)
  const centerPoint = toMetersFromCenter([x1, y1], center)
  const centerPointFlippedY = [centerPoint[0], -centerPoint[1]] as [number, number]

  mesh.update = createUpdateClosure(mesh, middleSlice)

  return {
    mesh,
    centerPoint: centerPointFlippedY,
    boundingCircleRadius: 2
  }
}
