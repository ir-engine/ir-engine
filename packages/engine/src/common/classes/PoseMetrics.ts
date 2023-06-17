/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Quaternion, Vector3 } from 'three'

export class PoseMetrics {
  position: Vector3 | null = null
  orientation: Quaternion | null = null

  deltaPosition = new Vector3()
  deltaRotation = new Quaternion()

  update(newPosition?: Vector3 | DOMPointReadOnly | null, newOrientation?: Quaternion | DOMPointReadOnly) {
    if (!newPosition || !newOrientation) {
      if (this.position || this.orientation) {
        this.position = null
        this.orientation = null
        this.deltaPosition.set(0, 0, 0)
        this.deltaRotation.identity()
      }
      return
    }

    if (!this.position) this.position = new Vector3().copy(newPosition as any)
    if (!this.orientation) this.orientation = new Quaternion().copy(newOrientation as any)

    // final - initial
    this.deltaPosition.copy(newPosition as any).sub(this.position)
    this.deltaRotation
      .copy(newOrientation as any)
      .invert()
      .multiply(this.orientation)
    this.position.copy(newPosition as any)
    this.orientation.copy(newOrientation as any)
  }
}
