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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Opaque } from '@ir-engine/hyperflux'

export type ObjectLayer = Opaque<'ObjectLayer', number>

export const ObjectLayers = {
  // anything loaded as a scene entity
  Scene: 0 as ObjectLayer,

  // intersect with camera raycast
  Camera: 1 as ObjectLayer,

  // for portal effect rendering & hiding the scene
  Portal: 2 as ObjectLayer,

  // avatars
  Avatar: 3 as ObjectLayer,

  // gizmos (ik targets, infinite grid, origin)
  Gizmos: 4 as ObjectLayer,

  // XRUI, loading screen envmap mesh
  UI: 5 as ObjectLayer,

  // used to hide objects from studio screenshot/texture baking
  Helper: 6 as ObjectLayer,

  // this only exists as an edge case in postprocessing - probably not worth keeping
  UVOL: 30 as ObjectLayer
}
export type ObjectLayerMask = Opaque<'ObjectLayerMask', number>

export const ObjectLayerMasks = {
  Scene: (1 << ObjectLayers.Scene) as ObjectLayerMask,
  Camera: (1 << ObjectLayers.Camera) as ObjectLayerMask,
  Portal: (1 << ObjectLayers.Portal) as ObjectLayerMask,
  Avatar: (1 << ObjectLayers.Avatar) as ObjectLayerMask,
  Gizmos: (1 << ObjectLayers.Gizmos) as ObjectLayerMask,
  UI: (1 << ObjectLayers.UI) as ObjectLayerMask,
  Helper: (1 << ObjectLayers.Helper) as ObjectLayerMask,
  UVOL: (1 << ObjectLayers.UVOL) as ObjectLayerMask
}

/*
 * Get the layer mask for a given layer.
 * @param layer - The layer to get the mask for.
 * @returns The layer mask for the given layer, or if the layermask is not found for a given layer, returns null.
 */
export const getLayerMaskFromLayer = (layer: ObjectLayer): ObjectLayerMask | null => {
  const bitShiftedValue = 1 << layer
  return ObjectLayerMasks[ObjectLayers[bitShiftedValue]] ?? null
}
