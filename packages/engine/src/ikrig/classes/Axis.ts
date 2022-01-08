import { Vector3 } from 'three'

import { FORWARD, LEFT, UP } from '../constants/Vector3Constants'

/*
3x3 Rotation Matrix
R  T  F      
00 03 06
01 04 07
02 05 08

left	(0,1,2)
up		(3,4,5)
forward	(6,7,9)
*/
export class Axis {
  x: Vector3
  y: Vector3
  z: Vector3
  constructor() {
    this.x = new Vector3().copy(LEFT)
    this.y = new Vector3().copy(UP)
    this.z = new Vector3().copy(FORWARD)
  }
  //Passing in Vectors.
  set(x, y, z, do_norm = false) {
    this.x.copy(x)
    this.y.copy(y)
    this.z.copy(z)

    if (do_norm) {
      this.x.normalize()
      this.y.normalize()
      this.z.normalize()
    }
    return this
  }

  fromDirection(fwd, up) {
    this.z.copy(fwd).normalize()
    this.x.copy(up).cross(this.z).normalize()
    this.y.copy(this.z).cross(this.x).normalize()
    return this
  }

  rotate(rad, axis = 'x', out: any = null) {
    out = out || this

    const sin = Math.sin(rad),
      cos = Math.cos(rad)
    let x, y, z

    switch (axis) {
      case 'y': //..........................
        x = this.x[0]
        z = this.x[2]
        this.x[0] = z * sin + x * cos //x
        this.x[2] = z * cos - x * sin //z

        x = this.z[0]
        z = this.z[2]
        this.z[0] = z * sin + x * cos //x
        this.z[2] = z * cos - x * sin //z
        break
      case 'x': //..........................
        y = this.y[1]
        z = this.y[2]
        this.y[1] = y * cos - z * sin //y
        this.y[2] = y * sin + z * cos //z

        y = this.z[1]
        z = this.z[2]
        this.z[1] = y * cos - z * sin //y
        this.z[2] = y * sin + z * cos //z
        break
      case 'z': //..........................
        x = this.x[0]
        y = this.x[1]
        this.x[0] = x * cos - y * sin //x
        this.x[1] = x * sin + y * cos //y

        x = this.y[0]
        y = this.y[1]
        this.y[0] = x * cos - y * sin //x
        this.y[1] = x * sin + y * cos //y
        break
    }

    return out
  }
}
