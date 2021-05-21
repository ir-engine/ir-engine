import { Quaternion, Vector3, Euler } from 'three';
import { updateMatrix, updateMatrixWorld, getWorldQuaternion, updateMatrixMatrixWorld } from '../functions/UnityHelpers';


const rightVector = new Vector3(1, 0, 0);
const z180Quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);

const localVector = new Vector3();
const localVector2 = new Vector3();
const localQuaternion = new Quaternion();
const localQuaternion2 = new Quaternion();
const localQuaternion3 = new Quaternion();
const localEuler = new Euler();

/**
 * 
 * @author Avaer Kazmer
 */
class ShoulderPoser {


}

export default ShoulderPoser;