import { SAPBroadphase, ContactMaterial, Material, World } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { Engine } from '../../ecs/classes/Engine';
import { Shape, Body } from 'cannon-es';
import { Mesh } from 'three';
import debug from "cannon-es-debugger";

export class PhysicsManager extends Component<PhysicsManager> {
  static instance: PhysicsManager
  frame: number
  physicsWorld: World
  groundMaterial = new Material('groundMaterial')
  wheelMaterial = new Material('wheelMaterial')
  trimMeshMaterial = new Material('trimMeshMaterial')
  wheelGroundContactMaterial = new ContactMaterial(this.wheelMaterial, this.groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })
  /*
  trimMeshContactMaterial = new ContactMaterial(this.trimMeshMaterial, this.groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })
*/
	parallelPairs: any[];
	physicsFrameRate: number;
	physicsFrameTime: number;
  physicsMaxPrediction: number;

  constructor (options:{ framerate: number }) {
    super();
    console.log("Constructing physics manager", options)
    PhysicsManager.instance = this;
    this.frame = 0;
    this.physicsWorld = new World();
    this.physicsFrameRate = options.framerate;
    this.physicsFrameTime = 1 / this.physicsFrameRate;
    this.physicsMaxPrediction = this.physicsFrameRate;
    this.physicsWorld.allowSleep = false;
    // this.physicsWorld.solver.iterations = 10;

    // We must add the contact materials to the world
  //  this.physicsWorld.addContactMaterial(PhysicsManager.instance.wheelGroundContactMaterial);
  //  this.physicsWorld.addContactMaterial(PhysicsManager.instance.trimMeshContactMaterial);

    // Physics
    this.physicsWorld.gravity.set(0, -9.81, 0);
    this.physicsWorld.broadphase = new SAPBroadphase(this.physicsWorld);
    //  this.physicsWorld.broadphase = new NaiveBroadphase();

    this.parallelPairs = [];

     console.log("========PhysicsManager.instance.physicsWorld");
     console.log(PhysicsManager.instance.physicsWorld);
     const DebugOptions = {
       onInit: (body: Body, mesh: Mesh, shape: Shape) => 	{
        // console.log("PH INIT: body: ", body, " | mesh: ", mesh, " | shape: ", shape)
       },
       onUpdate: (body: Body, mesh: Mesh, shape: Shape) => {
         //if (body === Engine.actor
         //console.log("PH  UPD: body position: ", body.position, " | body: ", body, " | mesh: ", mesh, " | shape: ", shape) }
     }};
    // debug(Engine.scene, PhysicsManager.instance.physicsWorld.bodies, DebugOptions);
  }

  dispose():void {
    super.dispose();

    console.log("**** Disposing")
    PhysicsManager.instance.groundMaterial = null
    PhysicsManager.instance.wheelMaterial = null
    PhysicsManager.instance.trimMeshMaterial = null
    PhysicsManager.instance.wheelGroundContactMaterial = null
  //  PhysicsManager.instance.trimMeshContactMaterial = null

    PhysicsManager.instance = null;
    this.frame = 0;
    this.physicsWorld.broadphase = null
    this.physicsWorld = null
  }
}
PhysicsManager.schema = {
  physicsWorld: { type: Types.Ref, default: null }
};
