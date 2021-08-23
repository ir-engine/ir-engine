import { Feature, LineString, Position } from 'geojson'
import { Vector3, Object3D, Camera } from 'three'
import { Text } from 'troika-three-text'
import { length, lineSliceAlong } from '@turf/turf'

const axisY = new Vector3(0, 1, 0)
const vector3 = new Vector3(1, 0, 0)

function normalizeAngle(angle: number) {
  return angle < 0 ? Math.PI * 2 + angle : angle
}

export class GeoLabelNode extends Text {
  geoFeature: Feature<LineString>
  geoLength?: number
  transformGeoPosition: (position: Position) => Position

  text: string
  fontSize: number
  color: number
  anchorX: string
  outlineWidth: string
  outlineColor: string

  visible: boolean

  constructor(feature: Feature<LineString>, transformGeoPosition: (position: Position) => Position) {
    super()
    this.geoFeature = feature
    this.transformGeoPosition = transformGeoPosition

    this.text = feature.properties.name
    this.fontSize = 6
    this.color = 0x000000
    this.anchorX = '50%'
    this.outlineWidth = '2%'
    this.outlineColor = 'white'

    // Update the rendering:
    ;(this as any).sync()
  }
  update(camera: Camera) {
    const self = this as unknown as Object3D
    this.geoLength = this.geoLength || length(this.geoFeature)
    const slice = lineSliceAlong(
      this.geoFeature,
      this.geoLength * 0.49,
      this.geoLength * 0.51
    ).geometry.coordinates.map(this.transformGeoPosition)

    const angle = Math.atan2(slice[1][1] - slice[0][1], slice[1][0] - slice[0][0])

    self.position.y = 20
    self.position.x = slice[0][0]
    // for some reason the positions are mirrored along the X-axis
    self.position.z = slice[0][1] * -1

    camera.getWorldDirection(vector3)

    const cameraAngle = normalizeAngle(Math.atan2(vector3.x, vector3.z))
    const angleDiff = normalizeAngle(cameraAngle - angle)
    self.quaternion.setFromAxisAngle(
      axisY,
      angleDiff < Math.PI / 2 || angleDiff > (Math.PI * 3) / 2 ? angle + Math.PI : angle
    )

    self.visible = self.position.distanceTo(camera.position) < 400
  }
}
