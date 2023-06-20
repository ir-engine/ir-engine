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

export function getObjectComponents(object) {
  return (
    object.userData.gltfExtensions &&
    object.userData.gltfExtensions.componentData &&
    object.userData.gltfExtensions.componentData
  )
}
export function getObjectComponent(object, componentName) {
  const components = getObjectComponents(object)
  return components && components[componentName]
}
export function getGLTFComponents(gltfDef) {
  return gltfDef.extensions && gltfDef.extensions.componentData
}
export function getGLTFComponent(gltfDef, componentName) {
  const components = getGLTFComponents(gltfDef)
  return components && components[componentName]
}
export function traverseGltfNode(gltf, nodeIndex, callback) {
  const nodeDef = gltf.nodes && gltf.nodes[nodeIndex]
  if (nodeDef) {
    callback(nodeDef, nodeIndex)
    if (Array.isArray(nodeDef.children)) {
      for (const childIndex of nodeDef.children) {
        traverseGltfNode(gltf, childIndex, callback)
      }
    }
  }
}
export function traverseGltfScene(gltf, sceneIndex, callback) {
  const sceneDef = gltf.scenes && gltf.scenes[sceneIndex]
  if (sceneDef) {
    if (Array.isArray(sceneDef.nodes)) {
      for (const nodeIndex of sceneDef.nodes) {
        traverseGltfNode(gltf, nodeIndex, callback)
      }
    }
  }
}
export function traverseGltfNodeEarlyOut(gltf, nodeIndex, callback) {
  const nodeDef = gltf.nodes && gltf.nodes[nodeIndex]
  if (nodeDef) {
    const value = callback(nodeDef, nodeIndex)
    if (value !== false && Array.isArray(nodeDef.children)) {
      for (const childIndex of nodeDef.children) {
        traverseGltfNodeEarlyOut(gltf, childIndex, callback)
      }
    }
  }
}
export function traverseGltfSceneEarlyOut(gltf, sceneIndex, callback) {
  const sceneDef = gltf.scenes && gltf.scenes[sceneIndex]
  if (sceneDef) {
    if (Array.isArray(sceneDef.nodes)) {
      for (const nodeIndex of sceneDef.nodes) {
        traverseGltfNodeEarlyOut(gltf, nodeIndex, callback)
      }
    }
  }
}
