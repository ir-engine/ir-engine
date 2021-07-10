import {
  Scene,
  Mesh,
  Points,
  SphereBufferGeometry,
  BoxBufferGeometry,
  PlaneBufferGeometry,
  BufferGeometry,
  MeshBasicMaterial,
  Vector3,
  Matrix4,
  Quaternion,
  LineBasicMaterial,
  Line,
  MeshStandardMaterial,
  Material,
  BufferAttribute
} from 'three'
import {
  Body,
  BoxObstacle,
  CapsuleObstacle,
  Controller,
  Obstacle,
  PhysXInstance,
  BodyType,
  SHAPES,
  Shape
} from 'three-physx'
import { CapsuleBufferGeometry } from '../../common/classes/CapsuleBufferGeometry'

const parentMatrix = new Matrix4()
const childMatrix = new Matrix4()
const pos = new Vector3()
const rot = new Quaternion()
const quat = new Quaternion()
const scale = new Vector3(1, 1, 1)
const scale2 = new Vector3(1, 1, 1)
export class DebugRenderer {
  private scene: Scene
  private _meshes: Map<number, any> = new Map<number, any>()
  private _obstacles: Map<number, any> = new Map<number, any>()
  private _raycasts: Map<number, any> = new Map<number, any>()
  private _materials: Material[]
  private _sphereGeometry: SphereBufferGeometry
  private _boxGeometry: BoxBufferGeometry
  private _planeGeometry: PlaneBufferGeometry
  private _lineMaterial: LineBasicMaterial

  public enabled: boolean

  constructor(scene: Scene) {
    this.scene = scene
    this.enabled = false

    this._materials = [
      new MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
      new MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
      new MeshBasicMaterial({ color: 0x00aaff, wireframe: true }),
      new MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
      new MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.25 }),
      new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
    ]

    this._lineMaterial = new LineBasicMaterial({ color: 0x0000ff })
    this._sphereGeometry = new SphereBufferGeometry(1)
    this._boxGeometry = new BoxBufferGeometry()
    this._planeGeometry = new PlaneBufferGeometry(10000, 10000, 100, 100)
  }

  public setEnabled(enabled) {
    this.enabled = enabled
    if (!enabled) {
      this._meshes.forEach((mesh) => {
        this.scene.remove(mesh)
      })
      this._raycasts.forEach((mesh) => {
        this.scene.remove(mesh)
      })
      this._obstacles.forEach((mesh) => {
        this.scene.remove(mesh)
      })
      this._meshes.clear()
      this._raycasts.clear()
      this._obstacles.clear()
    }
  }

  public update() {
    if (!this.enabled) {
      return
    }

    PhysXInstance.instance._bodies.forEach((body: Body) => {
      pos.set(body.transform.translation.x, body.transform.translation.y, body.transform.translation.z)
      if (body.type === BodyType.CONTROLLER) {
        const controllerShapeID = (body as Controller)._shape.id
        this._updateController(body as Controller, controllerShapeID)
        this._meshes.get(controllerShapeID).position.copy(pos)
        return
      }
      rot.set(
        body.transform.rotation.x,
        body.transform.rotation.y,
        body.transform.rotation.z,
        body.transform.rotation.w
      )
      parentMatrix.compose(pos, rot, scale)

      body.shapes.forEach((shape: Shape) => {
        this._updateMesh(body, shape.id, shape)

        if (this._meshes.get(shape.id)) {
          // Copy to meshes
          pos.set(shape.transform.translation.x, shape.transform.translation.y, shape.transform.translation.z)
          rot.set(
            shape.transform.rotation.x,
            shape.transform.rotation.y,
            shape.transform.rotation.z,
            shape.transform.rotation.w
          )
          childMatrix.compose(pos, rot, scale)
          childMatrix.premultiply(parentMatrix)
          childMatrix.decompose(pos, rot, scale2)
          this._meshes.get(shape.id).position.copy(pos)
          this._meshes.get(shape.id).quaternion.copy(rot)
        }
      })
    })
    PhysXInstance.instance._raycasts.forEach((raycast, id) => {
      this._updateRaycast(raycast, id)
    })
    PhysXInstance.instance._obstacles.forEach((obstacle, id) => {
      this._updateObstacle(obstacle, id)
    })
    this._obstacles.forEach((mesh, id) => {
      if (!PhysXInstance.instance._obstacles.has(id)) {
        this.scene.remove(mesh)
        this._meshes.delete(id)
      }
    })
    this._meshes.forEach((mesh, id) => {
      if (!PhysXInstance.instance._shapes.has(id)) {
        this.scene.remove(mesh)
        this._meshes.delete(id)
      }
    })
  }

  private _updateRaycast(raycast, id) {
    let line = this._raycasts.get(id)
    if (!line) {
      line = new Line(
        new BufferGeometry().setFromPoints([
          new Vector3().add(raycast.origin),
          new Vector3().add(raycast.origin).add(raycast.direction)
        ]),
        this._lineMaterial
      )
      this.scene.add(line)
      this._raycasts.set(id, line)
    } else {
      line.geometry.setFromPoints([
        new Vector3().add(raycast.origin),
        new Vector3().add(raycast.direction).multiplyScalar(raycast.maxDistance).add(raycast.origin)
      ])
    }
  }

  private _updateObstacle(obstacle: Obstacle, id) {
    if (!this._obstacles.get(id)) {
      const geom = obstacle.isCapsule
        ? new CapsuleBufferGeometry(
            (obstacle as CapsuleObstacle).radius,
            (obstacle as CapsuleObstacle).radius,
            (obstacle as CapsuleObstacle).halfHeight * 2
          )
        : new BoxBufferGeometry(
            (obstacle as BoxObstacle).halfExtents.x * 2,
            (obstacle as BoxObstacle).halfExtents.y * 2,
            (obstacle as BoxObstacle).halfExtents.z * 2
          )
      const mesh = new Mesh(geom, this._materials[5])
      mesh.position.copy(obstacle.position)
      mesh.quaternion.copy(obstacle.rotation)
      this.scene.add(mesh)
      this._obstacles.set(id, mesh)
    }
  }

  private _updateController(controller: Controller, id: number) {
    let mesh = this._meshes.get(id)
    let needsUpdate = false
    if (controller._debugNeedsUpdate) {
      if (mesh) {
        this.scene.remove(mesh)
        needsUpdate = true
      }
      delete controller._debugNeedsUpdate
    }

    if (!mesh || needsUpdate) {
      if (controller._shape.isCapsule) {
        mesh = new Mesh(
          new CapsuleBufferGeometry(
            clampNonzeroPositive(controller.radius),
            clampNonzeroPositive(controller.radius),
            clampNonzeroPositive(controller.height)
          ),
          this._materials[BodyType.CONTROLLER]
        )
      } else {
        mesh = new Mesh(
          new BoxBufferGeometry(
            clampNonzeroPositive(controller.halfSideExtent * 2),
            clampNonzeroPositive(controller.halfHeight * 2),
            clampNonzeroPositive(controller.halfForwardExtent * 2)
          ),
          this._materials[BodyType.CONTROLLER]
        )
      }
      this._meshes.set(id, mesh)
      this.scene.add(mesh)
    }
  }

  private _updateMesh(body: Body, id: number, shape: Shape) {
    let mesh = this._meshes.get(id)
    let needsUpdate = false
    if (shape._debugNeedsUpdate) {
      if (mesh) {
        this.scene.remove(mesh)
        needsUpdate = true
        this._scaleMesh(mesh, shape)
      }
      delete shape._debugNeedsUpdate
    }
    if (!mesh || needsUpdate) {
      mesh = this._createMesh(shape, body.type)
      this._meshes.set(id, mesh)
      this._scaleMesh(mesh, shape)
    }
  }

  private _createMesh(shape: Shape, type: BodyType): Mesh | Points {
    let mesh: Mesh | Points
    let geometry: BufferGeometry
    const material: Material = this._materials[shape.config.isTrigger ? 4 : type]
    let points: Vector3[] = []

    switch (shape.shape) {
      case SHAPES.Sphere:
        mesh = new Mesh(this._sphereGeometry, material)
        break

      case SHAPES.Capsule:
        mesh = new Mesh(
          new CapsuleBufferGeometry(
            clampNonzeroPositive(shape.options.radius),
            clampNonzeroPositive(shape.options.radius),
            clampNonzeroPositive(shape.options.halfHeight) * 2
          ),
          material
        )
        break

      case SHAPES.Box:
        mesh = new Mesh(this._boxGeometry, material)
        break

      case SHAPES.Plane:
        mesh = new Mesh(this._planeGeometry, material)
        break

      case SHAPES.ConvexMesh:
        geometry = new BufferGeometry()
        points = []
        for (let i = 0; i < shape.options.vertices.length; i += 3) {
          const [x, y, z] = [shape.options.vertices[i], shape.options.vertices[i + 1], shape.options.vertices[i + 2]]
          points.push(new Vector3(x, y, z))
        }
        geometry.setFromPoints(points)
        mesh = new Mesh(geometry, material)

        //highlight faces that the CONVEXPOLYHEDRON thinks are pointing into the shape.
        // geometry.faces.forEach(f => {
        //     const n = f.normal
        //     n.negate();
        //     f.normal = n
        //     const v1 = geometry.vertices[f.a]
        //     if (n.dot(v1) > 0) {
        //         const v2 = geometry.vertices[f.b]
        //         const v3 = geometry.vertices[f.c]

        //         const p = new Vector3();
        //         p.x = (v1.x + v2.x + v3.x) / 3;
        //         p.y = (v1.y + v2.y + v3.y) / 3;
        //         p.z = (v1.z + v2.z + v3.z) / 3;

        //         const g = new Geometry();
        //         g.vertices.push(v1, v2, v3)
        //         g.faces.push(new Face3(0, 1, 2));
        //         g.computeFaceNormals();
        //         const m = new Mesh(g, new MeshBasicMaterial({ color: 0xff0000 }));
        //         mesh.add(m)
        //     }
        // });
        break

      case SHAPES.TriangleMesh:
        geometry = new BufferGeometry()
        points = []
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(shape.options.vertices), 3))
        geometry.setIndex(shape.options.indices)
        mesh = new Mesh(geometry, material)
        break

      // case Shape.types.HEIGHTFIELD:
      //   geometry = new BufferGeometry();

      //   v0 = this.tmpVec0
      //   v1 = this.tmpVec1
      //   v2 = this.tmpVec2
      //   for (let xi = 0; xi < (shape as Heightfield).data.length - 1; xi++) {
      //     for (let yi = 0; yi < (shape as Heightfield).data[xi].length - 1; yi++) {
      //       for (let k = 0; k < 2; k++) {
      //         (shape as Heightfield).getConvexTrianglePillar(xi, yi, k === 0)
      //         v0.copy((shape as Heightfield).pillarConvex.vertices[0])
      //         v1.copy((shape as Heightfield).pillarConvex.vertices[1])
      //         v2.copy((shape as Heightfield).pillarConvex.vertices[2])
      //         v0.vadd((shape as Heightfield).pillarOffset, v0)
      //         v1.vadd((shape as Heightfield).pillarOffset, v1)
      //         v2.vadd((shape as Heightfield).pillarOffset, v2)
      //         points.push(
      //           new Vector3(v0.x, v0.y, v0.z),
      //           new Vector3(v1.x, v1.y, v1.z),
      //           new Vector3(v2.x, v2.y, v2.z)
      //         );
      //         //const i = geometry.vertices.length - 3
      //         //geometry.faces.push(new Face3(i, i + 1, i + 2))
      //       }
      //     }
      //   }
      //   geometry.setFromPoints(points)
      //   //geometry.computeBoundingSphere()
      //   //geometry.computeFaceNormals()
      //   mesh = new Mesh(geometry, material)
      //   break;
      default:
        mesh = new Mesh()
        break
    }

    if (mesh && mesh.geometry) {
      this.scene.add(mesh)
    }

    return mesh
  }

  private _scaleMesh(mesh: Mesh | Points, shape: Shape) {
    const scale = shape.transform.scale as Vector3
    if (shape.shape === SHAPES.Sphere) {
      const radius = clampNonzeroPositive(shape.options.radius)
      mesh.scale.set(radius, radius, radius)
    } else if (shape.shape === SHAPES.Box) {
      const { x, y, z } = shape.options.boxExtents
      mesh.scale.set(clampNonzeroPositive(x), clampNonzeroPositive(y), clampNonzeroPositive(z)).multiplyScalar(2)
    }
    mesh.scale.multiply(scale)
  }
}
const clampNonzeroPositive = (num) => {
  return Math.max(0.00001, num)
}
