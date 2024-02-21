import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { Color, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { AudioNodeGroups, MediaComponent, MediaElementComponent } from './MediaComponent'

export const AudioAnalysisComponent = defineComponent({
  name: 'Audio Analysis Component',
  jsonID: 'audio-analyzer',

  onInit: (entity) => {
    return {
      src: '',
      dataArray: null as Uint8Array | null,
      analyser: null as AnalyserNode | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.src && component.src.value !== json.src) {
      component.src.set(json.src)
    }
    if (json.dataArray && component.dataArray.value !== json.dataArray) {
      component.dataArray.set(json.dataArray)
    }
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value,
      dataArray: component.dataArray.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()

    const audioAnaylsisComponent = useComponent(entity, AudioAnalysisComponent)
    const posAudio = useOptionalComponent(entity, PositionalAudioComponent)

    const existingSystem = useComponent(entity, MediaComponent)

    useEffect(() => {
      setComponent(entity, VisibleComponent)
      setComponent(entity, NameComponent, 'AudioAnalysis')
      setComponent(entity, TransformComponent)
      const listenerMesh = new Mesh(new SphereGeometry(), new MeshStandardMaterial())
      listenerMesh.material.color = new Color(0xffffff)
    }, [])

    useEffect(() => {
      audioAnaylsisComponent.src.set(existingSystem?.path.values[0])
    }, [existingSystem.path])

    useEffect(() => {
      if (!posAudio) {
        return
      }

      const element = getComponent(entity, MediaElementComponent).element
      const audioObject = AudioNodeGroups.get(element)

      if (audioObject) {
        const audioContext = audioObject.source.context
        const analyser = audioContext.createAnalyser()
        audioObject.source.connect(analyser)
        analyser.connect(audioContext.destination)
        audioAnaylsisComponent.analyser.set(analyser)
      }
    }, [audioAnaylsisComponent, posAudio])

    return null
  }
})
