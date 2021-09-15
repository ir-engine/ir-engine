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
      // if (isControllerBody(body)) {
      //   const controllerShapeID = (body.getShapes() as any)._id
      //   this._updateController(body as any, controllerShapeID)
      //   this._meshes.get(controllerShapeID).position.copy(pos)
      //   return
      // }
      rot.set(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w)
      parentMatrix.compose(pos, rot, scale)
      ;(body as any)._shapes?.forEach((shape: PhysX.PxShape) => {
        const localPose = shape.getLocalPose()
        console.log(shape, (shape as any)._id)
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

  private _updateController(controller: PhysX.PxController, id: number) {
    let mesh = this._meshes.get(id)
    let needsUpdate = false
    if ((controller as any)._debugNeedsUpdate) {
      if (mesh) {
        this.scene.remove(mesh)
        needsUpdate = true
      }
      delete (controller as any)._debugNeedsUpdate
    }

    if (!mesh || needsUpdate) {
      if ((controller as any)._shape.isCapsule) {
        mesh = new Mesh(
          new CapsuleBufferGeometry(
            clampNonzeroPositive((controller as any).radius),
            clampNonzeroPositive((controller as any).radius),
            clampNonzeroPositive((controller as any).height)
          ),
          this._materials[BodyType.CONTROLLER]
        )
      } else {
        mesh = new Mesh(
          new BoxBufferGeometry(
            clampNonzeroPositive((controller as any).halfSideExtent * 2),
            clampNonzeroPositive((controller as any).halfHeight * 2),
            clampNonzeroPositive((controller as any).halfForwardExtent * 2)
          ),
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
    console.log(mesh, needsUpdate)
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
        const geometry = shape.getSphereGeometry()
        const radius = clampNonzeroPositive(geometry.radius)
        mesh = new Mesh(this._sphereGeometry, material)
        mesh.scale.set(radius, radius, radius)
        break
      }

      case PhysX.PxGeometryType.eCAPSULE.value: {
        const geometry = shape.getCapsuleGeometry()
        mesh = new Mesh(
          new CapsuleBufferGeometry(
            clampNonzeroPositive(geometry.radius),
            clampNonzeroPositive(geometry.radius),
            clampNonzeroPositive(geometry.halfHeight) * 2
          ),
          material
        )
        break
      }

      case PhysX.PxGeometryType.eBOX.value: {
        const geometry = shape.getBoxGeometry()
        const { x, y, z } = geometry.halfExtents
        mesh = new Mesh(this._boxGeometry, material)
        mesh.scale.set(clampNonzeroPositive(x), clampNonzeroPositive(y), clampNonzeroPositive(z)).multiplyScalar(2)
        break
      }

      case PhysX.PxGeometryType.ePLANE.value:
        console.log('plane!!!!!')
        mesh = new Mesh(this._planeGeometry, material)
        break

      case PhysX.PxGeometryType.eCONVEXMESH.value: {
        const geometry = shape.getConvexMeshGeometry()
        const geometryMesh = geometry.getConvexMesh()
        const verts = geometryMesh.getVertices()
        const bufferGeom = new BufferGeometry()
        const points = []
        for (let i = 0; i < verts.length; i++) {
          const [x, y, z] = [verts[i].x, verts[i].y, verts[i].z]
          points.push(new Vector3(x, y, z))
        }
        bufferGeom.setFromPoints(points)
        mesh = new Mesh(bufferGeom, material)
        break
      }

      case PhysX.PxGeometryType.eTRIANGLEMESH.value: {
        const geometry = shape.getTriangleMeshGeometry()
        const geometryMesh = geometry.getTriangleMesh()
        const verts = geometryMesh.getVertices()
        const indices = geometryMesh.getIndexBuffer()
        console.log(verts, indices)
        const bufferGeometry = new BufferGeometry()
        const points = []
        for (let i = 0; i < verts.length; i++) {
          const [x, y, z] = [verts[i].x, verts[i].y, verts[i].z]
          points.push(new Vector3(x, y, z))
        }
        bufferGeometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3))
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

    console.log('mesh', mesh)

    return mesh
  }
}
const clampNonzeroPositive = (num) => {
  return Math.max(0.00001, num)
}
