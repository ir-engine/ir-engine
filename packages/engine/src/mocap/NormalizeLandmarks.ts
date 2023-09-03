import { NormalizedLandmarkList, POSE_LANDMARKS } from '@mediapipe/holistic'
import { Box3, Vector3 } from 'three'

const bboxWorld = new Box3()
const bboxScreen = new Box3()

export const normalizeLandmarks = (worldLandmarks: NormalizedLandmarkList, screenLandmarks: NormalizedLandmarkList) => {
  // take the head height in world space, and multiiply all screen space landmarks by this to get world space landmarks

  bboxWorld.setFromPoints(worldLandmarks as Vector3[])
  bboxScreen.setFromPoints(screenLandmarks as Vector3[])

  const xRatio = (bboxWorld.max.x - bboxWorld.min.x) / (bboxScreen.max.x - bboxScreen.min.x)
  const yRatio = (bboxWorld.max.y - bboxWorld.min.y) / (bboxScreen.max.y - bboxScreen.min.y)
  const zRatio = (bboxWorld.max.z - bboxWorld.min.z) / (bboxScreen.max.z - bboxScreen.min.z)

  const normalizedScreenLandmarks = screenLandmarks.map((landmark) => ({
    ...landmark,
    x: landmark.x * xRatio,
    y: landmark.y * yRatio,
    z: landmark.z * zRatio
  }))

  const hipCenterX =
    (normalizedScreenLandmarks[POSE_LANDMARKS.LEFT_HIP].x + normalizedScreenLandmarks[POSE_LANDMARKS.RIGHT_HIP].x) / 2
  const hipCenterZ =
    (normalizedScreenLandmarks[POSE_LANDMARKS.LEFT_HIP].z + normalizedScreenLandmarks[POSE_LANDMARKS.RIGHT_HIP].z) / 2

  // translate all landmarks to the origin
  for (const landmark of normalizedScreenLandmarks) {
    landmark.x -= hipCenterX
    landmark.z -= hipCenterZ
  }

  return normalizedScreenLandmarks as NormalizedLandmarkList
}
