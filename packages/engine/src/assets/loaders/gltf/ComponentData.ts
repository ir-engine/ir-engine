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
