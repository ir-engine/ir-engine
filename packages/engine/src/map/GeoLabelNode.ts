import { Feature, LineString, Position } from 'geojson'
import { Vector3, Camera, Object3D } from 'three'
import { Text } from 'troika-three-text'
import { length, lineSliceAlong } from '@turf/turf'

const axisY = new Vector3(0, 1, 0)
const cameraDirection = new Vector3()

function normalizeAngle(angle: number) {
  return angle < 0 ? Math.PI * 2 + angle : angle
}

function createTextObject(textString: string): Text {
  const object3d = new Text()

  object3d.text = textString
  object3d.fontSize = DEFAULT_FONT_SIZE
  object3d.color = 0x000000
  object3d.fillOpacity = 0.5
  object3d.anchorX = '50%'
  object3d.anchorY = '50%'
  object3d.opacity = 0.5

  object3d.position.y = 0

  return object3d
}

const DEFAULT_FONT_SIZE = 6

export class GeoLabelNode {
  geoFeature: Feature<LineString>
  geoLength?: number
  geoMiddleSlice: Position[]

  object3d: Object3D & { sync(): void }

  constructor(feature: Feature<LineString>) {
    this.geoFeature = feature

    this.object3d = createTextObject(feature.properties.name)

    // Update the rendering:
    this.object3d.sync()

    this.geoLength = length(this.geoFeature)
    this.geoMiddleSlice = lineSliceAlong(
      this.geoFeature,
      this.geoLength * 0.49,
      this.geoLength * 0.51
    ).geometry.coordinates
  }
  onUpdate(camera: Camera) {
    const [[x1, y1], [x2, y2]] = this.geoMiddleSlice

    const angle = Math.atan2(y2 - y1, x2 - x1)

    camera.getWorldDirection(cameraDirection)

    const cameraAngle = normalizeAngle(Math.atan2(cameraDirection.x, cameraDirection.z))
    const angleDiff = normalizeAngle(cameraAngle - angle)
    this.object3d.quaternion.setFromAxisAngle(
      axisY,
      angleDiff < Math.PI / 2 || angleDiff > (Math.PI * 3) / 2 ? angle + Math.PI : angle
    )
    this.object3d.rotateX(-Math.PI / 2)

    this.object3d.sync()
  }
}
