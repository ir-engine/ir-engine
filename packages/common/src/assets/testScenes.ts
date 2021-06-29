import { MathUtils } from "three";
import { testScenePreset } from "./testScenePreset";
const { generateUUID } = MathUtils;

export const testUserId = generateUUID()

export const testScenes = {
  test: testScenePreset,
}

export const testWorldState = {
  tick: 100,
  transforms: [],
  ikTransforms: [],
  time: 0,
  inputs: [],
  clientsConnected: [
    {
      "userId": testUserId,
      "name": testUserId,
      "avatarDetail": {
        "thumbnailURL": "https://s3.amazonaws.com/xrengine-static-resources/avatars/Sonny.png",
        "avatarURL": "https://s3.amazonaws.com/xrengine-static-resources/avatars/Sonny.glb",
        "avatarId": "Andy"
      }
    }
  ],
  clientsDisconnected: [],
  createObjects: [
    {
      "networkId": 1,
      "prefabType": 0,
      "qW": 1,
      "qX": 0,
      "qY": 0,
      "qZ": 0,
      "x": 0,
      "y": 0,
      "z": 0,
      "ownerId": testUserId,
      "uniqueId": "character"
    }
  ],
  editObjects: [],
  destroyObjects: []
}