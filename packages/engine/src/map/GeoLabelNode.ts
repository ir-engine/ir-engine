import { Feature, Position } from 'geojson'
import { Object3D, Matrix4, Vector3 } from 'three'
import { Text } from 'troika-three-text'
import { length, along } from '@turf/turf'

export class GeoLabelNode extends Object3D {
  geoFeature: Feature

  constructor(feature: Feature, transformPosition: (position: Position) => Position) {
    super()
    this.geoFeature = feature

    const text = new Text()

    const point = transformPosition(along(feature as any, length(feature) / 2).geometry.coordinates)

    text.text = feature.properties.name
    text.fontSize = 6
    text.color = 0x000000
    text.anchorX = '50%'
    text.outlineWidth = '2%'
    text.outlineColor = 'white'

    // Update the rendering:
    text.sync()

    this.position.y = 20
    this.position.x = point[0]
    // For some reason the positions are mirrored along the X-axis
    this.position.z = point[1] * -1

    this.add(text)
  }
  update(cameraOrientation: Matrix4, cameraPosition: Vector3) {
    this.quaternion.setFromRotationMatrix(cameraOrientation)
    this.visible = this.position.distanceTo(cameraPosition) < 200
  }
}
