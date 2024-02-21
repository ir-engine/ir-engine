import { PresentationSystemGroup, defineQuery, defineSystem, getComponent } from '@etherealengine/ecs'
import { AudioAnalysisComponent } from '../../scene/components/AudioAnalysisComponent'

const audioAnalysisQuery = defineQuery([AudioAnalysisComponent])

export const AudioAnalysisSystem = defineSystem({
  uuid: 'ee.engine.AudioAnalysisSystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const entity of audioAnalysisQuery()) {
      const analysisComponent = getComponent(entity, AudioAnalysisComponent)
      const helper = analysisComponent.analyser

      if (helper) {
        const bufferLength = helper.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        helper.getByteFrequencyData(dataArray)
        if (dataArray) {
          analysisComponent.dataArray = dataArray
        }
      }
    }
  }
})
