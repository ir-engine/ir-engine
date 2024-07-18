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

describe('ClientInputHeuristics', () => {
  /**
  // @todo
  describe("applyRaycastedInput", () => {
    // todo??
    // set the `@param quaternion` to the sourceEid.worldRotation
    // set the raycast direction to ObjectDirection.Forward rotated by sourceEid.worldRotation
    // set the `@param raycast`.direction as the origin+(direction scaled by -0.01)
    // set the ray to go from sourceEid.origin to raycast.direction
    // set the raycaster to go from sourceEid.origin to raycast.direction
    // set the scene layer in the raycaster
    // test cases
    // should apply the editor heuristic only when EngineState.isEditing is true
    // should apply the XRUI heuristic only when EngineState.isEditing is false
    // should apply the PhysicsColliders heuristic only when EngineState.isEditing is false
    // should apply the BBoxes heuristic only when EngineState.isEditing is false
    // should always apply the Meshes heuristic
  })

  describe("applyProximity", () => {
    // if XRControlState.isCameraAttachedToAvatar and `@param isSpatialInput`, then inputSourceEntity should be `@param sourceEid` else it should be the avatar of the current User
    // shouldn't do anything if we didn't find a valid inputSourceEntity
    // get the position of the inputSourceEntity into the global _worldPosInputSourceComponent vector
    // for every spatialInputObject
      // skip the User avatar's entity
      // get the position of the inputEntity into the global _worldPosInputComponent vector
      // compute the distance from the inputSourceEntity to the inputEntity
      // If the distance is within the proximity threshold
        // should store the inputEntity and the distanceSquared to the inputSourceEntity into the intersectionData
  })

  describe("applyEditor", () => {
    // Find the list of gizmoPickerObjects.entity for the gizmo heuristic    (Input, Visible, Group, TransformGizmo)
    // Find the list of inputObjects  (Input, Visible, Group)
    // if there are gizmoPickerObjects,
    //   objects will be their GroupComponent arrays combined
    //   the raycaster will enable ObjectLayers.TransformGizmo
    // else:
    //   objects will be the combined GroupComponent arrays of the inputObjects list
    //   the raycaster will disable ObjectLayers.TransformGizmo
    // ... for all hits of `@param caster`.intersectObjects( objects, recursive )
      // find the first ancestor of the object hit that doesn't have a parent
      // should not do anything if the ancestor object we found does not belong to an entity
      // should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object hit by the `@param caster`
  })

  // execute.(smaller functions)
  describe("applyXRUI", () => {
    // for every entity of xruiQuery ...
      // get the XRUIComponent of the entity, and do a WebContainer3D.hitTest with the `@param ray`
      // should not do anything if ...
      // ... we didn't hit anything
      // ... we hit something, but its intersection.object is not marked as visible
      // ... we hit something, but the material.opacity of the its intersection.object is less than 0.01
      // should add the xruiQuery.entity and layerHit.intersection.distance to the `@param intersectionData`
      //   for every object hit by the `@param caster`
  })

  describe("applyPhysicsColliders", () => {
    it("should not do anything if there is no PhysicsState.physicsWorld", () => {})
    it("should not do anything if the given `@param raycast` does not hit any entities in the current PhysicsState.physicsWorld", () => {})
    it("should add the hit.entity and hit.distance to the `@param intersectionData` for every hit of the `@param raycast`", () => {})
  })

  describe("applyBBoxes", () => {
    describe("for every entity stored in the InputState.inputBoundingBoxes Set<Entity> ...", () => {
      it("... should not run if the entity does not have a BoundingBoxComponent", () => {})
      it("... should not run if casting the `@param ray` towards `@param hitTarget` would not intersect the boundingBox of the entity", () => {})
      it("... should add an entry to `@param intersectionData` containing the entity that was hit, and the distance to the hit (found with `ray.origin.distanceTo(hitTarget)`)", () => {})
    })
  })

  describe("applyMeshes", () => {
    // when `@param isEditing` is true ...
    // ... for the GroupComponents of all entities in the `meshesQuery()` that have a GroupComponent
    // when `@param isEditing` is false ...
    // ... for the objects contained in the GroupComponents, of all entities in the Array.from(InputState.inputMeshes) that have a GroupComponent
    // ... for all hits of `@param caster`.intersectObjects( objects, recursive )
      // should not do anything if the object hit does not have an entity or an ancestor with an entity
      // should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object hit by the `@param caster`", () => {})
  })
  */
})
