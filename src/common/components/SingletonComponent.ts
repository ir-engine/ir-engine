import { Component } from "ecsy"

export class SingletonComponent<T> extends Component<T> {
  static instance: SingletonComponent<any>
  constructor() {
    super(false)
    if (SingletonComponent.instance) {
      throw new Error("Error: Could not instantiate singleton component as it already exists.")
    }
    SingletonComponent.instance = this
  }
}
