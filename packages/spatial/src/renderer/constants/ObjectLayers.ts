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

export const ObjectLayers = {
  // anything loaded as a scene entity
  Scene: 0 as const,

  // intersect with camera raycast
  Camera: 1 as const,

  // for portal effect rendering & hiding the scene
  Portal: 2 as const,

  // avatars
  Avatar: 3 as const,

  // other gizmos (ik targets, infinite grid, origin)
  Gizmos: 4 as const,

  // XRUI, loading screen envmap mesh
  UI: 5 as const,

  // used to hide objects from studio screenshot/texture baking
  PhysicsHelper: 6 as const,
  AvatarHelper: 7 as const,
  NodeHelper: 8 as const,

  // custom threejs scene in a UI panel
  Panel: 9 as const,

  // transform gizmo
  TransformGizmo: 10 as const,

  // transform gizmo
  HighlightEffect: 11 as const,

  UVOL: 30 as const
} as Record<string, number>

export const ObjectLayerMasks = {
  Scene: 1 << ObjectLayers.Scene,
  Camera: 1 << ObjectLayers.Camera,
  Portal: 1 << ObjectLayers.Portal,
  Avatar: 1 << ObjectLayers.Avatar,
  Gizmos: 1 << ObjectLayers.Gizmos,
  UI: 1 << ObjectLayers.UI,
  PhysicsHelper: 1 << ObjectLayers.PhysicsHelper,
  AvatarHelper: 1 << ObjectLayers.AvatarHelper,
  NodeHelper: 1 << ObjectLayers.NodeHelper,
  Panel: 1 << ObjectLayers.Panel,
  TransformGizmo: 1 << ObjectLayers.TransformGizmo,
  HighlightEffect: 1 << ObjectLayers.HighlightEffect,
  UVOL: 1 << ObjectLayers.UVOL
} as Record<string, number>
