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
  Vector2,
  Vector3
} from 'three'
// import gasp from 'gsap'

/**
 * https://github.com/Mamboleoo/InfiniteTubes
 */

const rand = () => {
  return 0.5 - Math.random() * 0.05
}

export class PortalEffect extends Object3D {
  speed = 8
  curve: CatmullRomCurve3
  splineMesh: Line
  tubeMaterial: MeshBasicMaterial
  tubeGeometry: TubeGeometry
  tubeGeometry_o: BufferGeometry
  tubeMesh: Mesh
  textureParams: {
    offsetX: number
    offsetY: number
    repeatX: number
    repeatY: number
  }
  cameraShake: Vector2
  texture: Texture
  counter = 0
  fadingIn = false
  fadingOut = false
  numPoints = 200

  constructor(texture: Texture) {
    super()
    this.texture = texture

    this.createMesh()
    this.add(this.tubeMesh)
    // this.initAnimation();
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
    this.tubeMaterial.map.wrapS = MirroredRepeatWrapping
    this.tubeMaterial.map.wrapT = MirroredRepeatWrapping
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

    this.tubeGeometry_o = this.tubeGeometry.clone()
    this.tubeMesh = new Mesh(this.tubeGeometry, this.tubeMaterial)
    this.tubeMesh.position.set(-1, 0, 0)
  }

  fadeIn() {
    this.fadingIn = true
  }

  fadeOut() {
    this.fadingOut = true
  }

  deleteMesh() {
    this.remove(this.tubeMesh)
  }

  // initAnimation() {
  //   // Timeline animation
  //   this.textureParams = {
  //     offsetX: 0,
  //     offsetY: 0,
  //     repeatX: 10,
  //     repeatY: 4
  //   };
  //   this.cameraShake = new Vector2()
  // };

  updateMaterialOffset(delta: number) {
    this.tubeMaterial.map.offset.x += delta
  }

  // updateCurve(mouse: Vector2) {
  //   const tubeVertices = this.tubeGeometry.getAttribute('position') as BufferAttribute
  //   const tubeVertices_o = this.tubeGeometry_o.getAttribute('position') as BufferAttribute
  //   const splineVertices = this.splineMesh.geometry.getAttribute('position') as BufferAttribute

  //   // for (let i = 0; i < tubeVertices.array.length; i += 3) {
  //   //   const vertice_oX = tubeVertices_o.array[i];
  //   //   const verticeX = tubeVertices.array[i];
  //   //   const vertice_oY = tubeVertices_o.array[i + 1];
  //   //   const verticeY = tubeVertices.array[i + 1];
  //   //   const index = Math.floor(i / 30);
  //   //   tubeVertices.set([verticeX + (vertice_oX + splineVertices.array[index] - verticeX) / 15], i);
  //   //   tubeVertices.set([verticeY + (vertice_oY + splineVertices.array[index + 1] - verticeY) /15], i + 1);
  //   // }
  //   // tubeVertices.needsUpdate = true

  //   this.curve.points[2].x = 0.6 * (1 - mouse.x) - 0.3;
  //   this.curve.points[3].x = 0;
  //   this.curve.points[4].x = 0.6 * (1 - mouse.x) - 0.3;

  //   this.curve.points[2].y = 0.6 * (1 - mouse.y) - 0.3;
  //   this.curve.points[3].y = 0;
  //   this.curve.points[4].y = 0.6 * (1 - mouse.y) - 0.3;

  //   splineVertices.needsUpdate = true
  //   const curvePoints = this.curve.getPoints(70).map((val: Vector3) => { return val.toArray() }).flat()
  //   splineVertices.set(curvePoints);
  // };

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
    // this.createMesh()
    // this.updateCurve(mouse);
  }
}
