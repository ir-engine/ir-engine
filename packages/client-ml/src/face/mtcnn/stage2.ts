import * as tf from '@tensorflow/tfjs-core';
import { Box } from '../classes/Box';
import { nonMaxSuppression } from '../ops';
import { extractImagePatches } from './extractImagePatches';
import { MtcnnBox } from './MtcnnBox';
import { RNet } from './RNet';
import { RNetParams } from './types';

export async function stage2(
  img: HTMLCanvasElement,
  inputBoxes: Box[],
  scoreThreshold: number,
  params: RNetParams,
  stats: any
) {

  let ts = Date.now()
  const rnetInputs = await extractImagePatches(img, inputBoxes, { width: 24, height: 24 })
  stats.stage2_extractImagePatches = Date.now() - ts

  ts = Date.now()
  const rnetOuts = rnetInputs.map(
    rnetInput => {
      const out = RNet(rnetInput, params)
      rnetInput.dispose()
      return out
    }
  )
  stats.stage2_rnet = Date.now() - ts

  const scoresTensor = rnetOuts.length > 1
    ? tf.concat(rnetOuts.map(out => out.scores))
    : rnetOuts[0].scores
  const scores = Array.from(await scoresTensor.data())
  scoresTensor.dispose()

  const indices = scores
    .map((score, index) => ({ score, index }))
    .filter(c => c.score > scoreThreshold)
    .map(({ index }) => index)

  const filteredBoxes = indices.map(index => inputBoxes[index])
  const filteredScores = indices.map(index => scores[index])

  let finalBoxes: Box[] = []
  let finalScores: number[] = []

  if (filteredBoxes.length > 0) {
    ts = Date.now()
    const indicesNms = nonMaxSuppression(
      filteredBoxes,
      filteredScores,
      0.7
    )
    stats.stage2_nms = Date.now() - ts

    const regions = indicesNms.map(index =>{
        const regionsData = rnetOuts[indices[index]].regions.arraySync()
        return new MtcnnBox(
          regionsData[0][0],
          regionsData[0][1],
          regionsData[0][2],
          regionsData[0][3]
        )
      }
    )

    finalScores = indicesNms.map(index => filteredScores[index])
    finalBoxes = indicesNms.map((index, i) => filteredBoxes[index].calibrate(regions[i]))
  }

  rnetOuts.forEach(t => {
    t.regions.dispose()
    t.scores.dispose()
  })

  return {
    boxes: finalBoxes,
    scores: finalScores
  }
}