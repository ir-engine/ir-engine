import { Component } from "ecsy"
import { World } from "cannon-es/src/world/World"
import { ContactMaterial } from "cannon-es/src/material/ContactMaterial"
import { SAPBroadphase } from "cannon-es/src/collision/SAPBroadphase"
import { Material } from "cannon-es/src/material/Material"

export class PhysicsWorld extends Component<any> {
  static instance: PhysicsWorld
  frame: number
  _physicsWorld: any
  timeStep: number
  groundMaterial = new Material("groundMaterial")
  wheelMaterial = new Material("wheelMaterial")
  wheelGroundContactMaterial = new ContactMaterial(this.wheelMaterial, this.groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })
  constructor() {
    super()
    PhysicsWorld.instance = this
    this.frame = 0
    this._physicsWorld = new World()
    this.timeStep = 1 / 60
    this._physicsWorld.gravity.set(0, -10, 0)
    //  this._physicsWorld.broadphase = new NaiveBroadphase();
    this._physicsWorld.broadphase = new SAPBroadphase(this._physicsWorld)

    // We must add the contact materials to the world
    this._physicsWorld.addContactMaterial(PhysicsWorld.instance.wheelGroundContactMaterial)
  }
}
PhysicsWorld.schema = {}
