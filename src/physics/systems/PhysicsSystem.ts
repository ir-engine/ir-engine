import * as CANNON from "cannon-es"
import { Entity, System } from "ecsy"
import { Object3DComponent } from "ecsy-three"
// TODO: Remove THREE references, replace with gl-matrix
import { Euler, Quaternion } from "three"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { RigidBody } from "../components/RigidBody"
import { VehicleBody } from "../components/VehicleBody"

function inputs(vehicle) {
  document.onkeydown = handler
  document.onkeyup = handler

  const maxSteerVal = 0.5
  const maxForce = 1000
  const brakeForce = 1000000
  function handler(event) {
    //console.log('test');
    const up = event.type == "keyup"

    if (!up && event.type !== "keydown") {
      return
    }

    vehicle.setBrake(0, 0)
    vehicle.setBrake(0, 1)
    vehicle.setBrake(0, 2)
    vehicle.setBrake(0, 3)

    // forward
    if (event.keyCode === 87) {
      vehicle.applyEngineForce(up ? 0 : -maxForce, 2)
      vehicle.applyEngineForce(up ? 0 : -maxForce, 3)
    }
    // backward
    else if (event.keyCode === 83) {
      vehicle.applyEngineForce(up ? 0 : maxForce, 2)
      vehicle.applyEngineForce(up ? 0 : maxForce, 3)
    } else if (event.keyCode === 66) {
      vehicle.setBrake(brakeForce, 0)
      vehicle.setBrake(brakeForce, 1)
      vehicle.setBrake(brakeForce, 2)
      vehicle.setBrake(brakeForce, 3)
    } else if (event.keyCode === 68) {
      // right
      vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0)
      vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1)
    }
    // left
    else if (event.keyCode === 65) {
      vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0)
      vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1)
    }
  }
}

const quaternion = new Quaternion()
const euler = new Euler()

export class PhysicsSystem extends System {
  static wheelGroundContactMaterial
  frame: number
  _physicsWorld: any
  timeStep: number
  init() {
    this.frame = 0
    this._physicsWorld = new CANNON.World()
    this.timeStep = 1 / 60
    this._physicsWorld.gravity.set(0, -10, 0)
    //  this._physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    this._physicsWorld.broadphase = new CANNON.SAPBroadphase(this._physicsWorld)

    //  this._physicsWorld.solver.iterations = 10;
    const groundMaterial = new CANNON.Material("groundMaterial")
    const wheelMaterial = new CANNON.Material("wheelMaterial")
    // TODO: Move onto component, which should reference a physics material (ideally this existing one)
    PhysicsSystem.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 1000
    })
    // We must add the contact materials to the world
    this._physicsWorld.addContactMaterial(PhysicsSystem.wheelGroundContactMaterial)

    /*
    world.broadphase = new CANNON.SAPBroadphase(world);
            world.gravity.set(0, 0, -10);
            world.defaultContactMaterial.friction = 0;
            */
  }

  execute(dt, t) {
    this.frame++

    this._physicsWorld.step(this.timeStep)

    for (const entity of this.queries.physicsRigidBody.added) {
      const physicsRigidBody = entity.getComponent(RigidBody)
      let object = physicsRigidBody.getObject3D()
      object ? "" : (object = { userData: { body: {} } })
      let body
      if (physicsRigidBody.type === "box") body = this._createBox(entity)
      else if (physicsRigidBody.type === "cylinder") body = this._createCylinder(entity)
      else if (physicsRigidBody.type === "share") body = this._createShare(entity)
      else if (physicsRigidBody.type === "convex") body = this._createConvexGeometry(entity, null)
      else if (physicsRigidBody.type === "ground") body = this._createGroundGeometry(entity)

      object.userData.body = body
      this._physicsWorld.addBody(body)
    }

    for (const entity of this.queries.vehicleBody.added) {
      const object = entity.getComponent<Object3DComponent>(Object3DComponent).value

      const vehicleComponent = entity.getComponent(VehicleBody) as VehicleBody

      const [vehicle, wheelBodies] = this._createVehicleBody(entity, vehicleComponent.convexMesh)
      object.userData.vehicle = vehicle
      vehicle.addToWorld(this._physicsWorld)

      for (let i = 0; i < wheelBodies.length; i++) {
        this._physicsWorld.addBody(wheelBodies[i])
      }
      inputs(vehicle)
      /*
      this._physicsWorld.addEventListener('postStep', function(){
        console.log('test');
                for (var i = 0; i < vehicle.wheelInfos.length; i++) {
                    vehicle.updateWheelTransform(i);
                    var t = vehicle.wheelInfos[i].worldTransform;
                    var wheelBody = wheelBodies[i];

                    wheelBody.position.copy(t.position);
                    wheelBody.quaternion.copy(t.quaternion);

                    let upAxisWorld = new CANNON.Vec3();
                    vehicle.getVehicleAxisWorld(vehicle.indexUpAxis, upAxisWorld);
                }
            });
*/
      //  console.log('test');
    }

    for (const entity of this.queries.physicsRigidBody.results) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = entity.getMutableComponent(TransformComponent) as TransformComponent
      const object = entity.getMutableComponent(Object3DComponent).value
      const body = object.userData.body
      //console.log(body);
      transform.position = body.position

      quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)

      transform.rotation = quaternion.toArray()
    }

    for (const entity of this.queries.vehicleBody.results) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = entity.getMutableComponent(TransformComponent) as TransformComponent
      const object = entity.getMutableComponent(Object3DComponent).value
      const vehicle = object.userData.vehicle.chassisBody

      transform.position = vehicle.position
      //transform.position.y += 0.6
      quaternion.set(vehicle.quaternion.x, vehicle.quaternion.y, vehicle.quaternion.z, vehicle.quaternion.w)
      transform.rotation = vehicle.quaternion.toArray()
    }
  }

  _createBox(entity) {
    const rigidBody = entity.getComponent(RigidBody)
    const transform = entity.getComponent(TransformComponent)

    const shape = new CANNON.Box(new CANNON.Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))

    const body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.addShape(shape)

    //  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    //  body.angularVelocity.set(0,1,1);
    body.angularDamping = 0.5

    return body
  }

  _createGroundGeometry(entity) {
    const rigidBody = entity.getComponent(RigidBody)
    const transform = entity.getComponent(TransformComponent)

    const shape = new CANNON.Box(new CANNON.Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))

    const body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.addShape(shape)

    //  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    //  body.angularVelocity.set(0,1,1);
    body.angularDamping = 0.5

    return body
  }

  _createCylinder(entity) {
    const rigidBody = entity.getComponent(RigidBody)
    const transform = entity.getComponent(TransformComponent)

    const cylinderShape = new CANNON.Cylinder(rigidBody.scale.x, rigidBody.scale.y, rigidBody.scale.z, 20)
    const body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })
    //body.type = CANNON.Body.KINEMATIC;
    //body.collisionFilterGroup = 1; // turn off collisions
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.addShape(cylinderShape, new CANNON.Vec3(), q)
    //body.angularVelocity.set(0,0,1);
    return body
  }

  _createShare(entity) {
    const rigidBody = entity.getComponent(RigidBody)
    const transform = entity.getComponent(TransformComponent)

    const shape = new CANNON.Sphere(rigidBody.scale.x / 2)

    const body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })

    body.addShape(shape)
    return body
  }

  _createConvexGeometry(entity: Entity, mesh: THREE.Mesh) {
    let rigidBody, object, transform, attributePosition
    if (mesh) {
      object = mesh
      attributePosition = object.geometry.attributes.position
    } else {
      rigidBody = entity.getComponent(RigidBody)
      transform = entity.getComponent(TransformComponent)
      object = transform.getObject3D()
      attributePosition = object.geometry.attributes.position
    }

    const convexBody = new CANNON.Body({
      mass: 50
    })
    const verts = [],
      faces = [],
      normals = []

    // Get vertice
    for (let j = 0; j < attributePosition.array.length; j += 3) {
      verts.push(new CANNON.Vec3(attributePosition.array[j], attributePosition.array[j + 1], attributePosition.array[j + 2]))
    }
    console.log(verts)
    // Get faces

    for (let j = 0; j < object.geometry.index.array.length; j += 3) {
      faces.push([object.geometry.index.array[j], object.geometry.index.array[j + 1], object.geometry.index.array[j + 2]])
    }
    /*
      for(var j=0; j<attributeNormal.array.length; j+=3){
          normals.push([
            attributeNormal.array[j],
            attributeNormal.array[j+1],
            attributeNormal.array[j+2]
          ]);
      }
*/
    console.log(faces)
    console.log(normals)
    // Get offset
    //  let offset = new CANNON.Vec3(200,200,200);

    // Construct polyhedron
    const bunnyPart = new CANNON.ConvexPolyhedron({ vertices: verts, faces })
    console.log(bunnyPart)

    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 1, 0), -Math.PI / 2)
    //  body.addShape(cylinderShape, new CANNON.Vec3(), q);
    // Add to compound
    convexBody.addShape(bunnyPart, new CANNON.Vec3(), q) //,offset);
    return convexBody
  }

  _createVehicleBody(entity: Entity, mesh: any): [CANNON.RaycastVehicle, CANNON.Body[]] {
    const transform = entity.getComponent<TransformComponent>(TransformComponent)
    let chassisBody
    if (mesh) {
      chassisBody = this._createConvexGeometry(entity, mesh)
    } else {
      const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1.2, 2.8))
      chassisBody = new CANNON.Body({ mass: 150 })
      chassisBody.addShape(chassisShape)
    }
    //  let
    chassisBody.position.copy(transform.position)
    //  chassisBody.angularVelocity.set(0, 0, 0.5);

    const options = {
      radius: 0.5,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true
    }

    // Create the vehicle
    const vehicle = new CANNON.RaycastVehicle({
      chassisBody: chassisBody,
      indexUpAxis: 1,
      indexRightAxis: 0,
      indexForwardAxis: 2
    })

    options.chassisConnectionPointLocal.set(1.4, -0.6, 2.35)
    vehicle.addWheel(options)

    options.chassisConnectionPointLocal.set(-1.4, -0.6, 2.35)
    vehicle.addWheel(options)

    options.chassisConnectionPointLocal.set(-1.4, -0.6, -2.2)
    vehicle.addWheel(options)

    options.chassisConnectionPointLocal.set(1.4, -0.6, -2.2)
    vehicle.addWheel(options)

    const wheelBodies = []
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      const wheel = vehicle.wheelInfos[i]
      const cylinderShape = new CANNON.Cylinder(1, 1, 0.1, 20)
      const wheelBody = new CANNON.Body({
        mass: 0
      })
      wheelBody.type = CANNON.Body.KINEMATIC
      wheelBody.collisionFilterGroup = 0 // turn off collisions
      const q = new CANNON.Quaternion()
      //   q.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI / 2);
      wheelBody.addShape(cylinderShape)
      //   wheelBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2)
      wheelBodies.push(wheelBody)
      //demo.addVisual(wheelBody);
      //world.addBody(wheelBody);
    }

    return [vehicle, wheelBodies]
  }
}

PhysicsSystem.queries = {
  physicsRigidBody: {
    components: [RigidBody],
    listen: {
      added: true
    }
  },
  vehicleBody: {
    components: [VehicleBody],
    listen: {
      added: true
    }
  }
}
