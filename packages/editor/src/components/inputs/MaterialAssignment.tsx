import React, { Fragment, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Color, MathUtils, Texture } from 'three'

import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import {
  extractDefaults,
  formatMaterialArgs,
  materialIdToDefaultArgs
} from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { PatternTarget } from '@xrengine/engine/src/renderer/materials/MaterialParms'
import {
  MaterialOverrideComponent,
  MaterialOverrideComponentType
} from '@xrengine/engine/src/scene/components/MaterialOverrideComponent'
import { ModelComponentType } from '@xrengine/engine/src/scene/components/ModelComponent'
import { refreshMaterials } from '@xrengine/engine/src/scene/functions/loaders/MaterialOverrideFunctions'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

import { Typography } from '@mui/material'
import { Box } from '@mui/system'

import { AssetLoader } from '../../../../engine/src/assets/classes/AssetLoader'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import BooleanInput from './BooleanInput'
import { Button } from './Button'
import ColorInput from './ColorInput'
import CompoundNumericInput from './CompoundNumericInput'
import { ImagePreviewInputGroup } from './ImagePreviewInput'
import InputGroup, { InputGroupContent, InputGroupVerticalContainerWide, InputGroupVerticalContent } from './InputGroup'
import { MaterialInput } from './MaterialInput'
import NumericInput from './NumericInput'
import SelectInput from './SelectInput'
import StringInput, { ControlledStringInput } from './StringInput'
import { TexturePreviewInputGroup } from './TexturePreviewInput'

export default function MaterialAssignment({
  entity,
  node,
  modelComponent,
  values,
  onChange
}: {
  entity: Entity
  node: EntityTreeNode
  modelComponent: State<ModelComponentType>
  values: State<MaterialOverrideComponentType[]>
  onChange: (value) => void
}) {
  let [count, setCount] = useState(values.length)

  const { t } = useTranslation()

  function onChangeSize(text) {
    const count = parseInt(text)
    let preCount = values.length
    if (count == undefined || preCount == count) return
    if (preCount > count) values.set(values.value.slice(0, count - 1))
    else {
      const nuMats = new Array()
      for (let i = 0; i < count - preCount; i++) {
        nuMats.push({
          entity: -1,
          targetEntity: node.entity,
          materialID: '',
          args: {},
          patternTarget: PatternTarget.OBJ3D,
          pattern: '~',
          uuid: MathUtils.generateUUID()
        })
      }
      values.set([...values.value, ...nuMats])
    }
    preCount = count
    onChange(values.value)
  }

  function onRemoveEntry(idx) {
    return () => {
      const removing = values.at(idx)!.value
      values.set(values.filter((_, i) => i !== idx).map((x) => x.value))
      if (removing.entity ?? 0 > -1) removeComponent(removing.entity!, MaterialOverrideComponent)
      setCount(values.length)
      onChangeSize(values.length)
    }
  }

  function onAddEntry() {
    setCount(values.length + 1)
    onChangeSize(`${values.length + 1}`)
  }

  async function onRefresh() {
    const nuVals = await refreshMaterials(node.entity)
    values.forEach((_, idx) => values[idx].set(nuVals[idx]))
    onChange(values)
  }

  function MaterialAssignmentEntry(index) {
    const assignment = values[index]

    return (
      <div key={`${entity}-${index}-entry`}>
        <span>
          <InputGroup
            key={`${entity}-${index}-materialID`}
            name="Material ID"
            label={t('editor:properties.materialAssignment.lbl-materialID')}
          >
            <MaterialInput
              error={t('editor:properties.materialAssignment.error-materialID')}
              placeholder={t('editor:properties.materialAssignment.placeholder-materialID')}
              value={assignment.materialID.value}
              onChange={assignment.materialID.set}
            />
          </InputGroup>
          <InputGroup
            key={`${entity}-${index}-patternTarget`}
            name={`Pattern Target`}
            label={t('editor:properties.materialAssignment.lbl-patternTarget')}
          >
            <SelectInput
              value={assignment.patternTarget.value}
              onChange={assignment.patternTarget.set}
              options={[
                { label: 'Object3D Name', value: PatternTarget.OBJ3D },
                { label: 'Mesh Name', value: PatternTarget.MESH },
                { label: 'Material Name', value: PatternTarget.MATERIAL }
              ]}
            />
          </InputGroup>
          <InputGroup
            key={`${entity}-${index}-pattern`}
            name="Pattern"
            label={t('editor:properties.materialAssignment.lbl-pattern')}
          >
            <StringInput value={assignment.pattern.value as string} onChange={assignment.pattern.set} />
          </InputGroup>
        </span>
        <div>
          <Button onClick={onRemoveEntry(index)} style={{ background: '#a21' }}>
            Delete
          </Button>
        </div>
      </div>
    )
  }
  return (
    <CollapsibleBlock label={'Material Overrides'}>
      <InputGroupVerticalContainerWide>
        {values?.length > 0 &&
          (() => {
            return (
              <Box component="div">
                <Button onClick={onRefresh}>
                  <p>Refresh</p>
                </Button>
              </Box>
            )
          })()}
        <InputGroupVerticalContent>
          <div>
            <label> Count: {count}</label>
            <Button onClick={onAddEntry}>+</Button>
            {count > 0 && <Button onClick={onRemoveEntry(count - 1)}>-</Button>}
          </div>
          {values &&
            values.map((value, idx) => {
              return (
                <div key={`${entity}-${idx}-overrideEntry`}>
                  <label>{idx + 1}: </label>
                  {MaterialAssignmentEntry(idx)}
                </div>
              )
            })}
        </InputGroupVerticalContent>
      </InputGroupVerticalContainerWide>
    </CollapsibleBlock>
  )
}
