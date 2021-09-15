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
  BufferAttribute,
  Float32BufferAttribute
} from 'three'
import { CapsuleBufferGeometry } from '../../common/classes/CapsuleBufferGeometry'
import { World } from '../../ecs/classes/World'
import { getGeometryType, isControllerBody, isTriggerShape } from '../../physics/classes/Physics'
import { BodyType } from '../../physics/types/PhysicsTypes'

const parentMatrix = new Matrix4()
const childMatrix = new Matrix4()
const pos = new Vector3()
const rot = new Quaternion()
const quat = new Quaternion()
const scale = new Vector3(1, 1, 1)
const scale2 = new Vector3(1, 1, 1)
const halfPI = Math.PI / 2

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

  public update(world: World) {
    if (!this.enabled) {
      return
    }

    world.physics.bodies.forEach((body: PhysX.PxRigidActor) => {
      const pose = body.getGlobalPose()
      pos.set(pose.translation.x, pose.translation.y, pose.translation.z)
      if (isControllerBody(body)) {
        const controllerShapeID = (body as any)._shapes[0]._id
        this._updateController(body as any)
        this._meshes.get(controllerShapeID).position.copy(pos)
        return
      }
      rot.set(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w)
      parentMatrix.compose(pos, rot, scale)
      ;(body as any)._shapes?.forEach((shape: PhysX.PxShape) => {
        const localPose = shape.getLocalPose()
        this._updateMesh(body, (shape as any)._id, shape)

        if (this._meshes.get((shape as any)._id)) {
          // Copy to meshes
          pos.set(localPose.translation.x, localPose.translation.y, localPose.translation.z)
          rot.set(localPose.rotation.x, localPose.rotation.y, localPose.rotation.z, localPose.rotation.w)
          childMatrix.compose(pos, rot, scale)
          childMatrix.premultiply(parentMatrix)
          childMatrix.decompose(pos, rot, scale2)
          this._meshes.get((shape as any)._id).position.copy(pos)
          this._meshes.get((shape as any)._id).quaternion.copy(rot)
        }
      })
    })
    // world.physics.raycasts.forEach((raycast, id) => {
    //   this._updateRaycast(raycast, id)
    // })
    // world.physics.obstacles.forEach((obstacle, id) => {
    //   this._updateObstacle(obstacle, id)
    // })
    // this._obstacles.forEach((mesh, id) => {
    //   if (!world.physics.obstacles.has(id)) {
    //     this.scene.remove(mesh)
    //     this._meshes.delete(id)
    //   }
    // })
    this._meshes.forEach((mesh, id) => {
      if (!world.physics.shapes.has(id)) {
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

  private _updateObstacle(obstacle, id) {
    if (!this._obstacles.get(id)) {
      const geom = obstacle.isCapsule
        ? new CapsuleBufferGeometry(obstacle.radius, obstacle.radius, obstacle.halfHeight * 2)
        : new BoxBufferGeometry(obstacle.halfExtents.x * 2, obstacle.halfExtents.y * 2, obstacle.halfExtents.z * 2)
      const mesh = new Mesh(geom, this._materials[5])
      mesh.position.copy(obstacle.position)
      mesh.quaternion.copy(obstacle.rotation)
      this.scene.add(mesh)
      this._obstacles.set(id, mesh)
    }
  }

  private _updateController(body: PhysX.PxRigidActor) {
    const shape = (body as any)._shapes[0] as PhysX.PxShape
    const id = (shape as any)._id
    let mesh = this._meshes.get(id)
    let needsUpdate = false
    if ((body as any)._debugNeedsUpdate) {
      if (mesh) {
        this.scene.remove(mesh)
        needsUpdate = true
      }
      delete (body as any)._debugNeedsUpdate
    }

    if (!mesh || needsUpdate) {
      const geometryType = getGeometryType(shape)
      if (geometryType === PhysX.PxGeometryType.eCAPSULE.value) {
        const geometry = new PhysX.PxCapsuleGeometry(1, 1)
        shape.getCapsuleGeometry(geometry)
        mesh = new Mesh(
          new CapsuleBufferGeometry(
            clampNonzeroPositive(geometry.radius),
            clampNonzeroPositive(geometry.radius),
            clampNonzeroPositive(geometry.halfHeight * 2)
          ),
          this._materials[BodyType.CONTROLLER]
        )
      } else {
        const geometry = new PhysX.PxBoxGeometry(1, 1, 1)
        shape.getBoxGeometry(geometry)
        const { x, y, z } = geometry.halfExtents
        mesh = new Mesh(
          new BoxBufferGeometry(clampNonzeroPositive(x * 2), clampNonzeroPositive(y * 2), clampNonzeroPositive(z * 2)),
          this._materials[BodyType.CONTROLLER]
        )
      }
      this._meshes.set(id, mesh)
      this.scene.add(mesh)
    }
  }

  private _updateMesh(body: PhysX.PxRigidActor, id: number, shape: PhysX.PxShape) {
    let mesh = this._meshes.get(id)
    let needsUpdate = false
    if ((shape as any)._debugNeedsUpdate) {
      if (mesh) {
        this.scene.remove(mesh)
        needsUpdate = true
      }
      delete (shape as any)._debugNeedsUpdate
    }
    if (!mesh || needsUpdate) {
      mesh = this._createMesh(shape, body)
      this._meshes.set(id, mesh)
    }
  }

  private _createMesh(shape: PhysX.PxShape, body: PhysX.PxRigidActor): Mesh | Points {
    const isTrigger = isTriggerShape(shape)
    const geometryType = getGeometryType(shape)
    let mesh: Mesh
    const material: Material = this._materials[isTrigger ? 4 : (body as any)._type]

    switch (geometryType) {
      case PhysX.PxGeometryType.eSPHERE.value: {
        const geometry = new PhysX.PxSphereGeometry(1)
        shape.getSphereGeometry(geometry)
        const radius = clampNonzeroPositive(geometry.radius)
        mesh = new Mesh(this._sphereGeometry, material)
        mesh.scale.set(radius, radius, radius)
        break
      }

      case PhysX.PxGeometryType.eCAPSULE.value: {
        const geometry = new PhysX.PxCapsuleGeometry(1, 1)
        shape.getCapsuleGeometry(geometry)
        mesh = new Mesh(
          new CapsuleBufferGeometry(
            clampNonzeroPositive(geometry.radius),
            clampNonzeroPositive(geometry.radius),
            clampNonzeroPositive(geometry.halfHeight) * 2
          ).rotateZ(-halfPI),
          material
        )
        break
      }

      case PhysX.PxGeometryType.eBOX.value: {
        const geometry = new PhysX.PxBoxGeometry(1, 1, 1)
        shape.getBoxGeometry(geometry)
        const { x, y, z } = geometry.halfExtents
        mesh = new Mesh(this._boxGeometry, material)
        mesh.scale.set(clampNonzeroPositive(x), clampNonzeroPositive(y), clampNonzeroPositive(z)).multiplyScalar(2)
        break
      }

      case PhysX.PxGeometryType.ePLANE.value: {
        mesh = new Mesh(this._planeGeometry.clone(), material)
        // idk
        mesh.geometry.rotateY(-halfPI)
        mesh.geometry.rotateX(-halfPI)
        break
      }

      case PhysX.PxGeometryType.eCONVEXMESH.value: {
        const verts = (shape as any)._vertices
        const indices = (shape as any)._indices
        const bufferGeometry = new BufferGeometry()
        bufferGeometry.setAttribute('position', new Float32BufferAttribute(verts, 3))
        bufferGeometry.setIndex(indices)
        mesh = new Mesh(bufferGeometry, material)
        break
      }

      case PhysX.PxGeometryType.eTRIANGLEMESH.value: {
        const verts = (shape as any)._vertices
        const indices = (shape as any)._indices
        const bufferGeometry = new BufferGeometry()
        bufferGeometry.setAttribute('position', new Float32BufferAttribute(verts, 3))
        bufferGeometry.setIndex(indices)
        mesh = new Mesh(bufferGeometry, material)
        break
      }
      default:
        mesh = new Mesh()
        break
    }

    if (mesh && mesh.geometry) {
      this.scene.add(mesh)
    }

    return mesh
  }
}

const clampNonzeroPositive = (num) => {
  return Math.max(0.00001, num)
}
