import { MapFeatureLabel, Text3D } from '../types'
import { Text } from 'troika-three-text'
import { Feature, LineString, MultiLineString, Position } from 'geojson'
import * as turf from '@turf/turf'
import { Engine } from '../../ecs/classes/Engine'
import { Vector3 } from 'three'
import { LongLat, toMetersFromCenter } from '../functions/UnitConversionFunctions'
import { multiplyArray } from '../util'

const MINIMUM_FONT_SIZE = 6
const MAXIMUM_FONT_SIZE = 10
const WorldUp = new Vector3(0, 1, 0)
const $array2 = Array(2)

function normalizeAngle(angle: number) {
  return angle < 0 ? Math.PI * 2 + angle : angle
}

function createText(textString: string): Text3D {
  const object3d = new Text()

  object3d.text = textString
  object3d.fontSize = MINIMUM_FONT_SIZE
  object3d.color = 0x080808
  object3d.anchorX = '50%'
  object3d.anchorY = '50%'
  object3d.strokeColor = 0x707070
  object3d.strokeWidth = '1%'
  object3d.sdfGlyphSize = 16

  object3d.position.y = 0

  object3d.sync()

  return object3d
}

const $cameraDirection = new Vector3()
function createUpdateClosure(mesh: Text3D, middleSlice: Position[]) {
  return function updateFeatureLabel() {
    const camera = Engine.camera
    const [[x1, y1]] = middleSlice
    const [x2, y2] = middleSlice[middleSlice.length - 1]

    const angle = Math.atan2(y2 - y1, x2 - x1)

    camera.getWorldDirection($cameraDirection)

    const cameraAngle = normalizeAngle(Math.atan2($cameraDirection.x, $cameraDirection.z))
    const angleDiff = normalizeAngle(cameraAngle - angle)
    mesh.quaternion.setFromAxisAngle(
      WorldUp,
      angleDiff < Math.PI / 2 || angleDiff > (Math.PI * 3) / 2 ? angle + Math.PI : angle
    )
    mesh.rotateX(-Math.PI / 2)

    mesh.fontSize = Math.min(Math.max(Engine.camera.position.y / 4, MINIMUM_FONT_SIZE), MAXIMUM_FONT_SIZE)

    mesh.sync()
  }
}

export default function createFeatureLabel(
  labelText: string,
  lineString: Feature<LineString>,
  mapCenterPoint: LongLat
): MapFeatureLabel {
  const lineLen = turf.length(lineString)
  const middleSlice = turf.lineSliceAlong(lineString, lineLen * 0.48, lineLen * 0.52).geometry.coordinates

  const middlePoint = middleSlice[Math.floor(middleSlice.length / 2)]

  const [x1, y1] = toMetersFromCenter(middlePoint, mapCenterPoint)

  const mesh = createText(labelText)
  const centerPoint = [x1, -y1] as [number, number]

  mesh.update = createUpdateClosure(mesh, middleSlice)

  return {
    mesh,
    centerPoint,
    boundingCircleRadius: 2
  }
}
