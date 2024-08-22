/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { defineComponent } from ''

export const XRLayoutComponent = defineComponent({
  name: 'XRLayoutComponent',

  onInit: () => {
    return {
      position: new Vector3(),
      positionTransition: Transition.defineVector3Transition(),

      positionOrigin: new Vector3(),
      positionOriginTransition: Transition.defineVector3Transition(),

      alignmentOrigin: new Vector3(),
      alignmentTransition: Transition.defineVector3Transition(),

      rotation: new Quaternion(),
      rotationTransition: Transition.defineVector3Transition(),

      rotationOrigin: new Vector3(),
      rotationOriginTransition: Transition.defineVector3Transition(),

      size: new Vector3(),
      sizeMode: { x: 'proportional', y: 'proportional', z: 'proportional' } as XRSizeMode,
      sizeTransition: Transition.defineVector3Transition(),

      effectiveSize: new Vector3()
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const xrLayout = useComponent(entity, XRLayoutComponent)
    const parentEntity = useAncestorWithComponent(entity, XRLayoutComponent)
    const parentLayout = useOptionalComponent(parentEntity, XRLayoutComponent)

    // compute effective size
    useImmediateEffect(() => {
      if (!xrLayout) return
      const sizeMode = xrLayout.sizeMode.value
      const size = xrLayout.size.value
      const parentSize = parentLayout?.effectiveSize.value ?? Vector3_Zero
      xrLayout.effectiveSize.set(
        new Vector3(
          sizeMode.x === 'proportional' ? size.x * parentSize.x : size.x,
          sizeMode.y === 'proportional' ? size.y * parentSize.y : size.y,
          sizeMode.z === 'proportional' ? size.z * parentSize.z : size.z
        )
      )
    }, [xrLayout?.size, xrLayout?.sizeMode, parentLayout?.effectiveSize])

    return null
  }
})
