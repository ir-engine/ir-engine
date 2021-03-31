import { IBoundingBox } from '../classes/BoundingBox';
import { Box } from '../classes/Box';
import { FaceDetection } from '../classes/FaceDetection';
import { IRect } from '../classes/Rect';
import { isWithFaceDetection, WithFaceDetection } from '../factories/WithFaceDetection';
import { round } from '../utils';
import { DrawBox } from './DrawBox';

export type TDrawDetectionsInput = IRect | IBoundingBox | FaceDetection | WithFaceDetection<{}>

export function drawDetections(
  canvasArg: string | HTMLCanvasElement,
  detections: TDrawDetectionsInput | Array<TDrawDetectionsInput>
) {
  const detectionsArray = Array.isArray(detections) ? detections : [detections]

  detectionsArray.forEach(det => {
    const score = det instanceof FaceDetection
      ? det.score
      : (isWithFaceDetection(det) ? det.detection.score : undefined)

    const box = det instanceof FaceDetection
      ? det.box
      : (isWithFaceDetection(det) ? det.detection.box : new Box(det))

    const label = score ? `${round(score)}` : undefined
    new DrawBox(box, { label }).draw(canvasArg)
  })
}