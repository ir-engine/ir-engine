// Singleton component to store reference to camera and scene
import { Component, Types } from "ecsy"
import { SingletonComponent } from "./SingletonComponent"

// World data schema
interface PropTypes {
  scene: any
}

export class Scene extends SingletonComponent<PropTypes> {
  scene: any
}

Scene.schema = {
  scene: { type: Types.Ref, default: null }
}
