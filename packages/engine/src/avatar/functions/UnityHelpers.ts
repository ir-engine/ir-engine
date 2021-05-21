import { Object3D, Quaternion, Vector3 } from "three";

const localVector = new Vector3();
const localVector2 = new Vector3();

/**
 * 
 * @author Avaer Kazmer
 * Adapted from Unity3D
 */
  export function getWorldPosition(o: Object3D, v: Vector3) {
    return v.setFromMatrixPosition(o.matrixWorld);
  }
  export function  getWorldQuaternion(o: Object3D, q: Quaternion) {
    o.matrixWorld.decompose(localVector, q, localVector2);
    return q;
  }
  export function getWorldScale(o: Object3D, v: Vector3) {
    return v.setFromMatrixScale(o.matrixWorld);
  }
  export function updateMatrix(o: Object3D) {
    o.matrix.compose(o.position, o.quaternion, o.scale);
  }
  export function updateMatrixWorld(o: Object3D) {
    o.matrixWorld.multiplyMatrices(o.parent.matrixWorld, o.matrix);
  }
  export function updateMatrixMatrixWorld(o: Object3D) {
    o.matrix.compose(o.position, o.quaternion, o.scale);
    o.matrixWorld.multiplyMatrices(o.parent.matrixWorld, o.matrix);
  }
  export function copyTransform(dst: Object3D, src: Object3D) {
    dst.position.copy(src.position);
    dst.quaternion.copy(src.quaternion);
    dst.scale.copy(src.scale);
  }