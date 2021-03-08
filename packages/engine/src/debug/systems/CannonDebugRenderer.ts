import { Body, Quaternion, Sphere, Box, Plane, ConvexPolyhedron, Trimesh, Heightfield, Shape, Vec3, World } from 'cannon-es';
import {
  Scene,
  Mesh,
  Points,
  SphereBufferGeometry,
  BoxBufferGeometry,
  PlaneBufferGeometry,
  BufferGeometry,
  PointsMaterial,
  MeshBasicMaterial,
  Vector3,
  SphereGeometry,
  BoxGeometry,
  PlaneGeometry,

} from 'three';

export class CannonDebugRenderer {

  public scene: Scene
  public world: World
  private _meshes: Mesh[] | Points[]
  private _material: MeshBasicMaterial
  private _particleMaterial = new PointsMaterial
  private _sphereGeometry: SphereBufferGeometry
  private _boxGeometry: BoxBufferGeometry
  private _planeGeometry: PlaneBufferGeometry
  private _particleGeometry: BufferGeometry

  private tmpVec0: Vec3 = new Vec3()
  private tmpVec1: Vec3 = new Vec3()
  private tmpVec2: Vec3 = new Vec3()
  private tmpQuat0: Quaternion = new Quaternion
  private enabled: boolean;

  constructor(scene: Scene, world: World, options?: object) {
    options = options || {}

    this.scene = scene
    this.world = world
    this.enabled = false;

    this._meshes = []

    this._material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    this._particleMaterial = new PointsMaterial({ color: 0xff0000, size: 10, sizeAttenuation: false, depthTest: false })
    this._sphereGeometry = new SphereBufferGeometry(1)
    this._boxGeometry = new BoxBufferGeometry(1, 1, 1)
    this._planeGeometry = new PlaneBufferGeometry(10, 10, 10, 10)
    this._particleGeometry = new BufferGeometry();
    this._particleGeometry.setFromPoints([new Vector3(0, 0, 0)]);
  }

  public setEnabled(enabled) {
    this.enabled = enabled;
    for(const mesh of this._meshes) {
      mesh.visible = this.enabled;
    }
  }

  public update() {

    if (!this.enabled) {
      return;
    }

    const bodies: Body[] = this.world.bodies
    const meshes: Mesh[] | Points[] = this._meshes
    const shapeWorldPosition: Vec3 = this.tmpVec0
    const shapeWorldQuaternion: Quaternion = this.tmpQuat0

    let meshIndex = 0

    for (let i = 0; i !== bodies.length; i++) {
      const body = bodies[i]

      for (let j = 0; j !== body.shapes.length; j++) {
        const shape = body.shapes[j]

        this._updateMesh(meshIndex, body, shape)

        const mesh = meshes[meshIndex]

        if (mesh) {

          // Get world position
          body.quaternion.vmult(body.shapeOffsets[j], shapeWorldPosition)
          body.position.vadd(shapeWorldPosition, shapeWorldPosition)

          // Get world quaternion
          body.quaternion.mult(body.shapeOrientations[j], shapeWorldQuaternion)

          // Copy to meshes
          mesh.position.x = shapeWorldPosition.x
          mesh.position.y = shapeWorldPosition.y
          mesh.position.z = shapeWorldPosition.z
          mesh.quaternion.x = shapeWorldQuaternion.x
          mesh.quaternion.y = shapeWorldQuaternion.y
          mesh.quaternion.z = shapeWorldQuaternion.z
          mesh.quaternion.w = shapeWorldQuaternion.w
        }

        meshIndex++;
      }
    }

    for (let i = meshIndex; i < meshes.length; i++) {
      const mesh: Mesh | Points = meshes[i];
      if (mesh) {
        this.scene.remove(mesh)
      }
    }

    meshes.length = meshIndex
  }

  private _updateMesh(index: number, body: Body, shape: Shape) {
    let mesh = this._meshes[index]
    if (!this._typeMatch(mesh, shape)) {
      if (mesh) {
        this.scene.remove(mesh)
      }
      mesh = this._meshes[index] = this._createMesh(shape)
    }
    this._scaleMesh(mesh, shape)
  }

  private _typeMatch(mesh: Mesh | Points, shape: Shape): Boolean {
    if (!mesh) {
      return false
    }
    const geo: BufferGeometry = mesh.geometry
    return (
      (geo instanceof SphereGeometry && shape instanceof Sphere) ||
      (geo instanceof BoxGeometry && shape instanceof Box) ||
      (geo instanceof PlaneGeometry && shape instanceof Plane) ||
      (geo.id === shape.id && shape instanceof ConvexPolyhedron) ||
      (geo.id === shape.id && shape instanceof Trimesh) ||
      (geo.id === shape.id && shape instanceof Heightfield)
    );
  }

  private _createMesh(shape: Shape): Mesh | Points {
    let mesh: Mesh | Points
    let geometry: BufferGeometry
    let v0: Vec3
    let v1: Vec3
    let v2: Vec3
    const material: MeshBasicMaterial = this._material;
    let points: Vector3[] = []

    switch (shape.type) {

      case Shape.types.SPHERE:
        mesh = new Mesh(this._sphereGeometry, material)
        break

      case Shape.types.BOX:
        mesh = new Mesh(this._boxGeometry, material)
        break

      case Shape.types.PLANE:
        mesh = new Mesh(this._planeGeometry, material)
        break

      case Shape.types.PARTICLE:
        mesh = new Points(this._particleGeometry, this._particleMaterial);
        break;

      case Shape.types.CONVEXPOLYHEDRON:
        // Create mesh                
        //console.log("creatin ConvexPolyhedron debug")
        geometry = new BufferGeometry()
        points = []
        for (let i = 0; i < (shape as ConvexPolyhedron).vertices.length; i += 1) {
          const v = (shape as ConvexPolyhedron).vertices[i]
          points.push(new Vector3(v.x, v.y, v.z));
        }
        geometry.setFromPoints(points)
        mesh = new Mesh(geometry, material);
        shape.id = geometry.id;

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
        break;

      case Shape.types.TRIMESH:
        console.log("creatin trimesh debug")
        geometry = new BufferGeometry();
        points = []
        for (let i = 0; i < (shape as Trimesh).vertices.length; i += 3) {
          points.push(new Vector3(
            (shape as Trimesh).vertices[i],
            (shape as Trimesh).vertices[i + 1],
            (shape as Trimesh).vertices[i + 2]));
        }
        geometry.setFromPoints(points)
        geometry.setIndex(Array.from((shape as Trimesh).indices))
        mesh = new Mesh(geometry, material);
        shape.id = geometry.id;
        break;

      case Shape.types.HEIGHTFIELD:
        geometry = new BufferGeometry();

        v0 = this.tmpVec0
        v1 = this.tmpVec1
        v2 = this.tmpVec2
        for (let xi = 0; xi < (shape as Heightfield).data.length - 1; xi++) {
          for (let yi = 0; yi < (shape as Heightfield).data[xi].length - 1; yi++) {
            for (let k = 0; k < 2; k++) {
              (shape as Heightfield).getConvexTrianglePillar(xi, yi, k === 0)
              v0.copy((shape as Heightfield).pillarConvex.vertices[0])
              v1.copy((shape as Heightfield).pillarConvex.vertices[1])
              v2.copy((shape as Heightfield).pillarConvex.vertices[2])
              v0.vadd((shape as Heightfield).pillarOffset, v0)
              v1.vadd((shape as Heightfield).pillarOffset, v1)
              v2.vadd((shape as Heightfield).pillarOffset, v2)
              points.push(
                new Vector3(v0.x, v0.y, v0.z),
                new Vector3(v1.x, v1.y, v1.z),
                new Vector3(v2.x, v2.y, v2.z)
              );
              //const i = geometry.vertices.length - 3
              //geometry.faces.push(new Face3(i, i + 1, i + 2))
            }
          }
        }
        geometry.setFromPoints(points)
        //geometry.computeBoundingSphere()
        //geometry.computeFaceNormals()
        mesh = new Mesh(geometry, material)
        shape.id = geometry.id
        break;
      default:
        mesh = new Mesh()
        break
    }

    if (mesh && mesh.geometry) {
      this.scene.add(mesh)
    }

    return mesh;
  }

  private _scaleMesh(mesh: Mesh | Points, shape: Shape) {
    switch (shape.type) {

      case Shape.types.SPHERE:
        const radius = (shape as Sphere).radius
        mesh.scale.set(radius, radius, radius)
        break

      case Shape.types.BOX:
        const halfExtents: Vec3 = (shape as Box).halfExtents
        mesh.scale.copy(new Vector3(halfExtents.x, halfExtents.y, halfExtents.z))
        mesh.scale.multiplyScalar(2)
        break;

      case Shape.types.CONVEXPOLYHEDRON:
        mesh.scale.set(1, 1, 1)
        break

      case Shape.types.TRIMESH:
        const scale: Vec3 = (shape as Trimesh).scale
        mesh.scale.copy(new Vector3(scale.x, scale.y, scale.z))
        break

      case Shape.types.HEIGHTFIELD:
        mesh.scale.set(1, 1, 1)
        break

    }
  }
}