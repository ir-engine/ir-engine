import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  Object3D,
  Texture,
  TubeGeometry,
  Vector3
} from 'three'

/**
 * https://github.com/Mamboleoo/InfiniteTubes
 */

const rand = () => {
  return 0.5 - Math.random() * 0.05
}

export class PortalEffect extends Object3D {
  curve: CatmullRomCurve3
  splineMesh: Line
  tubeMaterial: MeshBasicMaterial
  tubeGeometry: TubeGeometry
  tubeMesh: Mesh
  texture: Texture
  fadingIn = false
  fadingOut = false
  numPoints = 200

  constructor(texture: Texture) {
    super()
    this.texture = texture
    this.name = 'PortalEffect'

    this.createMesh()
    this.add(this.tubeMesh)
  }

  createMesh() {
    const points: Vector3[] = []

    for (let i = 0; i < this.numPoints; i += 1) {
      points.push(new Vector3(0, 0, i))
    }

    this.curve = new CatmullRomCurve3(points)
    this.curve.type = 'catmullrom'

    const geometry = new BufferGeometry()
    const curvePoints = new Float32Array(
      this.curve
        .getPoints(this.numPoints)
        .map((val: Vector3) => {
          return val.toArray()
        })
        .flat()
    )
    geometry.setAttribute('position', new BufferAttribute(curvePoints, 3))
    this.splineMesh = new Line(geometry, new LineBasicMaterial())

    this.tubeMaterial = new MeshBasicMaterial({
      side: BackSide,
      transparent: true,
      opacity: 0,
      map: this.texture
    })
    // @ts-ignore
    this.tubeMaterial.map.wrapS = MirroredRepeatWrapping
    // @ts-ignore
    this.tubeMaterial.map.wrapT = MirroredRepeatWrapping
    // @ts-ignore
    this.tubeMaterial.map.repeat.set(1, 10)

    const radialSegments = 24
    const tubularSegments = this.numPoints / 10

    this.tubeGeometry = new TubeGeometry(this.curve, tubularSegments, 2, radialSegments, false)
    const tube = this.tubeGeometry.getAttribute('position') as BufferAttribute

    const entryLength = 5
    const segmentSize = this.numPoints / tubularSegments

    for (let i = 0; i < radialSegments * entryLength; i++) {
      let factor = (segmentSize * entryLength - tube.getZ(i)) * 0.1
      tube.setX(i, tube.getX(i) * factor)
      tube.setY(i, tube.getY(i) * factor)
    }

    this.tubeMesh = new Mesh(this.tubeGeometry, this.tubeMaterial)
    this.tubeMesh.position.set(-0.5, 0, -15)
  }

  fadeIn(delta: number): Promise<void> {
    this.fadingIn = true

    return new Promise<void>((resolve) => {
      const portalFadeInInterval = setInterval(() => {
        if (!this.fadingIn) {
          clearInterval(portalFadeInInterval)
          resolve()
        }
      }, delta * 1000)
    })
  }

  fadeOut(delta: number): Promise<void> {
    console.log('fading out')
    this.fadingOut = true

    return new Promise<void>((resolve) => {
      const portalFadeOutInterval = setInterval(() => {
        // this.tubeMesh.position.z = lerp(-5, -200, 1 - this.tubeMaterial.opacity)
        if (!this.fadingOut) {
          clearInterval(portalFadeOutInterval)
          resolve()
        }
      }, delta * 1000)
    })
  }

  deleteMesh() {
    this.remove(this.tubeMesh)
  }

  updateMaterialOffset(delta: number) {
    // @ts-ignore
    this.tubeMaterial.map.offset.x += delta
  }

  update(delta: number) {
    this.updateMaterialOffset(delta)
    if (this.fadingIn) {
      if (this.tubeMaterial.opacity >= 1) {
        this.tubeMaterial.opacity = 1
        this.fadingIn = false
      } else {
        this.tubeMaterial.opacity += delta
      }
    }
    if (this.fadingOut) {
      if (this.tubeMaterial.opacity <= 0) {
        this.tubeMaterial.opacity = 0
        this.fadingOut = false
      } else {
        this.tubeMaterial.opacity -= delta
      }
    }
  }
}
