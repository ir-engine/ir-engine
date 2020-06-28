import Axis2D from "./Axis2D"

export default interface Axis3D extends Axis2D {
  // x comes from Axis1D
  // y comes from Axis2D
  z: number
}
