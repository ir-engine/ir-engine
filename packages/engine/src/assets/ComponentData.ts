/**
* Get the components of an object.
* If the object has a userData.gltfExtensions, check if it has a componentData.
* If it does, return the componentData.
* @param object - Object to get components from.
*/
export function getObjectComponents(object) {
  return (
    object.userData.gltfExtensions &&
    object.userData.gltfExtensions.componentData &&
    object.userData.gltfExtensions.componentData
  )
}

/**
* Get the component of an object.
* Get the components of an object.
* If the component is found, return it.
* @param object - Object.
* @param componentName - Component name.
* @return {@link ObjectComponent}
* @internal
*/ export function getObjectComponent(object, componentName) {
  const components = getObjectComponents(object)
  return components && components[componentName]
}

/**
* Get the glTF components.
* @param gltfDef - glTF definition.
* @return {@link ComponentData}
* @internal
*/
export function getGLTFComponents(gltfDef) {
  return gltfDef.extensions && gltfDef.extensions.componentData
}

/**
* Get a GLTFComponent from a glTF asset.
* Get all GLTFComponents from the glTF asset.
* @param gltfDef - glTF asset.
* @param componentName - Name of the component.
* @return {@link GLTFComponent} - GLTFComponent.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
 export function getGLTFComponent(gltfDef, componentName) {
  const components = getGLTFComponents(gltfDef)
  return components && components[componentName]
}

/**
* Traverse a gltf node.
* If the node has children, traverse them.
* @param gltf - gltf node.
* @param nodeIndex - Node index.
* @param callback - Callback function.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/

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

/**
* Traverse the GLTF scene.
* If the scene has nodes, traverse each node.
* @param gltf - GLTF asset.
* @param sceneIndex - Index of the scene in the GLTF asset.
* @param callback - Callback function.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
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

/**
* Traverse the GLTF node early out.
* If the node is a NodeDef, call the callback with the node and its index.
* If the node is a NodeDef, and the callback returns false, stop traversing the node.
* If the node is a NodeDef, and the callback returns true, and the node has children, traverse the children.
* @param gltf - GLTF instance.
* @param nodeIndex - Node index.
* @param callback - Callback function.
* @return {@link false} if the node is not a NodeDef, {@link true} if the node is a NodeDef and the callback returns true.
* @internal
*/
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

/**
* Traverse the scene early out.
* If the scene has nodes, traverse each node.
* @param gltf - GLTF model.
* @param sceneIndex - Scene index.
* @param callback - Callback function.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
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
