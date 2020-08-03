import * as CANNON from "cannon-es"
import { PhysicsRigidBody } from "../components/PhysicsRigidBody"
import { VehicleBody } from "../components/VehicleBody"
import { WheelBody } from "../components/WheelBody"

function inputs(vehicle) {
  document.onkeydown = handler
  document.onkeyup = handler

  var maxSteerVal = 0.5
  var maxForce = 1000
  var brakeForce = 1000000
  function handler(event) {
    //console.log('test');
    var up = event.type == "keyup"

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

var quaternion = new Quaternion()
var euler = new Euler()

export class PhysicsSystem extends System {
  init() {
    this.frame = 0
    this._physicsWorld = new CANNON.World()
    this.timeStep = 1 / 60
    this._physicsWorld.gravity.set(0, -10, 0)
    //  this._physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    this._physicsWorld.broadphase = new CANNON.SAPBroadphase(this._physicsWorld)

    //  this._physicsWorld.solver.iterations = 10;
    var groundMaterial = new CANNON.Material("groundMaterial")
    var wheelMaterial = new CANNON.Material("wheelMaterial")
    var wheelGroundContactMaterial = (window.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 1000
    }))
    // We must add the contact materials to the world
    this._physicsWorld.addContactMaterial(wheelGroundContactMaterial)

    /*
    world.broadphase = new CANNON.SAPBroadphase(world);
            world.gravity.set(0, 0, -10);
            world.defaultContactMaterial.friction = 0;
            */
  }

  execute(dt, t) {
    this.frame++

    this._physicsWorld.step(this.timeStep)

    for (let entity of this.queries.physicsRigidBody.added) {
      const physicsRigidBody = entity.getComponent(PhysicsRigidBody)
      let object = entity.getObject3D()
      object ? "" : (object = { userData: { body: {} } })
      let body
      if (physicsRigidBody.type === "box") body = this._createBox(entity)
      else if (physicsRigidBody.type === "cylinder") body = this._createCylinder(entity)
      else if (physicsRigidBody.type === "share") body = this._createShare(entity)
      else if (physicsRigidBody.type === "convex") body = this._createConvexGeometry(entity)
      else if (physicsRigidBody.type === "ground") body = this._createGroundGeometry(entity)

      object.userData.body = body
      this._physicsWorld.addBody(body)
    }

    for (let entity of this.queries.vehicleBody.added) {
      let object = entity.getObject3D()

      const vehicleComponent = entity.getComponent(VehicleBody)

      let [vehicle, wheelBodies] = this._createVehicleBody(entity, vehicleComponent.convexMesh)
      object.userData.vehicle = vehicle
      vehicle.addToWorld(this._physicsWorld)

      for (var i = 0; i < wheelBodies.length; i++) {
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

    for (let entity of this.queries.physicsRigidBody.results) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = entity.getMutableComponent(Transform)
      const object = entity.getObject3D()
      const body = object.userData.body
      //console.log(body);
      transform.position.copy(body.position)

      quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
      euler.setFromQuaternion(quaternion, "XYZ")

      transform.rotation.copy(euler)
    }

    for (let entity of this.queries.vehicleBody.results) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = entity.getMutableComponent(Transform)
      const object = entity.getObject3D()
      const vehicle = object.userData.vehicle.chassisBody

      transform.position.copy(vehicle.position)
      //transform.position.y += 0.6
      quaternion.set(vehicle.quaternion.x, vehicle.quaternion.y, vehicle.quaternion.z, vehicle.quaternion.w)
      euler.setFromQuaternion(quaternion, "XYZ")

      transform.rotation.copy(euler)
    }
  }

  _createBox(entity) {
    const rigidBody = entity.getComponent(PhysicsRigidBody)
    const transform = entity.getComponent(Transform)

    let shape = new CANNON.Box(new CANNON.Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))

    let body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })
    var q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.addShape(shape)

    //  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    //  body.angularVelocity.set(0,1,1);
    body.angularDamping = 0.5

    return body
  }

  _createGroundGeometry(entity) {
    const rigidBody = entity.getComponent(PhysicsRigidBody)
    const transform = entity.getComponent(Transform)

    let shape = new CANNON.Box(new CANNON.Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))

    let body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })
    var q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.addShape(shape)

    //  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    //  body.angularVelocity.set(0,1,1);
    body.angularDamping = 0.5

    return body
  }

  _createCylinder(entity) {
    const rigidBody = entity.getComponent(PhysicsRigidBody)
    const transform = entity.getComponent(Transform)

    var cylinderShape = new CANNON.Cylinder(rigidBody.scale.x, rigidBody.scale.y, rigidBody.scale.z, 20)
    var body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })
    //body.type = CANNON.Body.KINEMATIC;
    //body.collisionFilterGroup = 1; // turn off collisions
    var q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.addShape(cylinderShape, new CANNON.Vec3(), q)
    //body.angularVelocity.set(0,0,1);
    return body
  }

  _createShare(entity) {
    const rigidBody = entity.getComponent(PhysicsRigidBody)
    const transform = entity.getComponent(Transform)

    let shape = new CANNON.Sphere(rigidBody.scale.x / 2)

    let body = new CANNON.Body({
      mass: rigidBody.mass,
      position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z)
    })

    body.addShape(shape)
    return body
  }

  _createConvexGeometry(entity, mesh) {
    let rigidBody, object, transform, attributePosition
    if (mesh) {
      object = mesh
      attributePosition = mesh.geometry.attributes.position
    } else {
      rigidBody = entity.getComponent(PhysicsRigidBody)
      object = entity.getObject3D()
      transform = entity.getComponent(Transform)
      attributePosition = object.geometry.attributes.position
    }

    var convexBody = new CANNON.Body({
      mass: 50
    })
    let verts = [],
      faces = [],
      normals = []

    // Get vertice
    for (let j = 0; j < attributePosition.array.length; j += 3) {
      verts.push(new CANNON.Vec3(attributePosition.array[j], attributePosition.array[j + 1], attributePosition.array[j + 2]))
    }
    console.log(verts)
    // Get faces

    for (var j = 0; j < object.geometry.index.array.length; j += 3) {
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
    var bunnyPart = new CANNON.ConvexPolyhedron({ vertices: verts, faces })
    console.log(bunnyPart)

    var q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 1, 0), -Math.PI / 2)
    //  body.addShape(cylinderShape, new CANNON.Vec3(), q);
    // Add to compound
    convexBody.addShape(bunnyPart, new CANNON.Vec3(), q) //,offset);
    return convexBody
  }

  _createVehicleBody(entity, mesh) {
    const vehicleBody = entity.getComponent(VehicleBody)
    const transform = entity.getComponent(Transform)
    let chassisBody
    if (mesh) {
      chassisBody = this._createConvexGeometry(entity, mesh)
    } else {
      let chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1.2, 2.8))
      chassisBody = new CANNON.Body({ mass: 150 })
      chassisBody.addShape(chassisShape)
    }
    //  let
    chassisBody.position.copy(transform.position)
    //  chassisBody.angularVelocity.set(0, 0, 0.5);

    var options = {
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
    let vehicle = new CANNON.RaycastVehicle({
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

    var wheelBodies = []
    for (var i = 0; i < vehicle.wheelInfos.length; i++) {
      var wheel = vehicle.wheelInfos[i]
      var cylinderShape = new CANNON.Cylinder(1, 1, 0.1, 20)
      var wheelBody = new CANNON.Body({
        mass: 0
      })
      wheelBody.type = CANNON.Body.KINEMATIC
      wheelBody.collisionFilterGroup = 0 // turn off collisions
      var q = new CANNON.Quaternion()
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
    components: [PhysicsRigidBody],
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
