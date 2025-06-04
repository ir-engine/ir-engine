import { useHookstate } from '@hookstate/core'
import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { LightmapComponent } from '@ir-engine/editor/src/lightmapper/LightmapComponent'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Button } from '@ir-engine/ui'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLightbulb } from 'react-icons/md'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

const resolutionOptions = [
  { label: '256', value: 256 },
  { label: '512', value: 512 },
  { label: '1024', value: 1024 },
  { label: '2048', value: 2048 }
]

export const LightmapNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightmapComponent = useComponent(props.entity, LightmapComponent)

  const handleGenerateAtlas = () => {
    LightmapComponent.generateAtlas(props.entity)
  }

  const handleBakeLightmap = async () => {
    console.log('Baking lightmap for entity:', props.entity)
  }

  const unwrapperLoaded = useHookstate(LightmapComponent.unwrapper.isLoaded)

  useEffect(() => {
    if (!unwrapperLoaded.value) {
      LightmapComponent.loadUnwrapper().then(() => unwrapperLoaded.set(true))
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.lightmap.name') || 'Lightmap'}
      description={t('editor:properties.lightmap.description') || 'Lightmap settings for static objects'}
      Icon={LightmapNodeEditor.iconComponent}
    >
      <InputGroup name="Resolution" label={t('editor:properties.lightmap.lbl-resolution') || 'Resolution'}>
        <SelectInput
          options={resolutionOptions}
          value={lightmapComponent.resolution.value}
          onChange={commitProperty(LightmapComponent, 'resolution')}
        />
      </InputGroup>

      <InputGroup name="Intensity" label={t('editor:properties.lightmap.lbl-intensity') || 'Intensity'}>
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={0.5}
          largeStep={1.0}
          value={lightmapComponent.intensity.value}
          onChange={commitProperty(LightmapComponent, 'intensity')}
        />
      </InputGroup>

      <div className="mt-2 flex flex-col gap-2">
        <Button onClick={handleGenerateAtlas} disabled={!unwrapperLoaded.value}>
          {t('editor:properties.lightmap.btn-generateAtlas') || 'Generate UV2 Atlas'}
        </Button>
        <Button onClick={handleBakeLightmap} disabled={!unwrapperLoaded.value}>
          {t('editor:properties.lightmap.btn-bakeLightmap') || 'Bake Lightmap'}
        </Button>
      </div>
    </NodeEditor>
  )
}

LightmapNodeEditor.iconComponent = MdLightbulb

export default LightmapNodeEditor
