const disposeScene = (scene) => {
  while (scene.children.length > 0) {
    disposeScene(scene.children[0])
    scene.remove(scene.children[0])
  }
  if (scene.geometry) scene.geometry.dispose()

  if (scene.material) {
    //in case of map, bumpMap, normalMap, envMap ...
    Object.keys(scene.material).forEach((prop) => {
      if (!scene.material[prop]) return
      if (scene.material[prop] !== null && typeof scene.material[prop].dispose === 'function')
        scene.material[prop].dispose()
    })
    scene.material.dispose()
  }
}

export default disposeScene
