import { Quaternion, Vector3 } from 'three';
import { NetworkObject } from '../components/NetworkObject';
/**
 * Initialize Network object
 * @param ownerId ID of owner of newly created object.
 * @param networkId ID of network in which object will be created.
 * @param prefabType Type of prefab which will be used to create the object.
 * @param position Position of the object.
 * @param rotation Rotation of the object.
 *
 * @returns Newly created object.
 */
export declare function initializeNetworkObject(ownerId: string, networkId: number, prefabType: string | number, position?: Vector3, rotation?: Quaternion): NetworkObject;
