import { SAPBroadphase, ContactMaterial, Material, World } from 'cannon-es';

import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class PhysicsManager extends Component<PhysicsManager> {
  static instance: PhysicsManager
  frame: number
  physicsWorld: World
  timeStep: number
  groundMaterial = new Material('groundMaterial')
  wheelMaterial = new Material('wheelMaterial')
  wheelGroundContactMaterial = new ContactMaterial(this.wheelMaterial, this.groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })

	parallelPairs: any[];
	physicsFrameRate: number;
	physicsFrameTime: number;
  physicsMaxPrediction: number;
  

  constructor () {
    super();
    PhysicsManager.instance = this;
    this.frame = 0;
    this.physicsWorld = new World();
    this.timeStep = 1 / 60;
    this.physicsWorld.gravity.set(0, -10, 0);
    //  this.physicsWorld.broadphase = new NaiveBroadphase();
    this.physicsWorld.broadphase = new SAPBroadphase(this.physicsWorld);

    // We must add the contact materials to the world
    this.physicsWorld.addContactMaterial(PhysicsManager.instance.wheelGroundContactMaterial);

      	// Physics
        this.physicsWorld.gravity.set(0, -9.81, 0);
        this.physicsWorld.broadphase = new SAPBroadphase(this.physicsWorld);
        // this.physicsWorld.solver.iterations = 10;
        this.physicsWorld.allowSleep = true;

        this.parallelPairs = [];
        this.physicsFrameRate = 60;
        this.physicsFrameTime = 1 / this.physicsFrameRate;
        this.physicsMaxPrediction = this.physicsFrameRate;
  }

  dispose():void {
    super.dispose();

    PhysicsWorld.instance.groundMaterial = null
    PhysicsWorld.instance.wheelMaterial = null
    PhysicsWorld.instance.wheelGroundContactMaterial = null

    PhysicsWorld.instance = null;
    this.frame = 0;
    this.physicsWorld.broadphase.dispose()
    this.physicsWorld.broadphase = null
    this.physicsWorld.dispose()
    this.physicsWorld = null
  }
}
PhysicsManager.schema = {
  physicsWorld: { type: Types.Ref, default: null }
};
