import { Color, Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { Object3DWithEntity } from '../components/Object3DComponent'
import cloneObject3D from './cloneObject3D'

/*
export const serializeForGLTFExport = (object3d: Object3DWithEntity) => {
  const stagedRoot = object3d//prepareForClone(object3d)
  const clonnedObject = stagedRoot//cloneObject3D(stagedRoot, true)

  //prepareObjectForGLTFExport(clonnedObject)
  clonnedObject.traverse((node: Object3DWithEntity) => {
    if (node.entity) {
      prepareObjectForGLTFExport(node)
    }
  })
  return clonnedObject
}


export const exportGLTF = (scene: Object3DWithEntity) => {
}

const prepareForClone = (root: Object3D) => {
  const toRemove = new Array<Object3D>()
  root.traverse((obj) => {
    //remove skeletonhelpers as they should not be serialized
    if (obj.type == "SkeletonHelper") {
      toRemove.push(obj)
    }
  })
  toRemove.forEach((obj) => obj.parent?.remove(obj))
  return root
}

*/
