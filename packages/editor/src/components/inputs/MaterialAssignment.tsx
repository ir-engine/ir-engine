import React, { Fragment, useState } from 'react'
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
  values: MaterialOverrideComponentType[]
  onChange: (value) => void
}) {
  let [count, setCount] = useState(values.length)

  function texKey(index, k) {
    if (!values[index].uuid) {
      values[index].uuid = MathUtils.generateUUID()
    }
    return `${values[index].uuid}-${k}`
  }

  const initialPaths: Map<string, string> = new Map(
    values.flatMap((entry, index) => {
      return entry.args
        ? Object.entries(entry.args)
            .filter(([k, v]) => (v as Texture)?.isTexture && (v as Texture).source.data)
            .map(([k, v]) => [texKey(index, k), (v as Texture).source.data.src])
        : []
    })
  )
  let [texturePaths, setTexturePaths] = useState<Map<string, string>>(initialPaths)

  const [expanded, setExpanded] = useState<Map<string, boolean>>(
    new Map(values.map((_, index) => [texKey(index, 'expanded'), false]))
  )

  const { t } = useTranslation()

  function onChangeSize(text) {
    const count = parseInt(text)
    let preCount = 0
    if (!values) values = []
    else preCount = values.length
    if (count == undefined || preCount == count) return
    if (preCount > count) values = values.slice(0, count - 1)
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
      values.push(...nuMats)
    }
    preCount = count
    onChange(values)
  }

  function onRemoveEntry(idx) {
    return () => {
      const removing = values[idx]
      clearTexturePaths(removing, idx)
      values.splice(idx, 1)
      if (removing.entity !== undefined && removing.entity > -1)
        removeComponent(removing.entity, MaterialOverrideComponent)
      setCount(values.length)
      onChangeSize(values.length)
    }
  }

  function clearTexturePaths(args, index) {
    if (!args) return
    const removingPaths = new Map(
      Object.entries(args)
        .filter(([k, v]) => (v as Texture).isTexture)
        .map(([k, v]) => [texKey(index, k), v])
    )
    const nuPaths = new Map([...texturePaths.entries()].filter(([k, v]) => !removingPaths.has(k)))
    setTexturePaths(nuPaths)
  }

  function onAddEntry() {
    setCount(values.length + 1)
    onChangeSize(`${values.length + 1}`)
  }

  function onChangeAssignment(assignment, index) {
    values[index] = assignment
    onChange(values)
  }

  async function onRefresh() {
    const nuVals = await refreshMaterials(node.entity)
    values.forEach((_, idx) => (values[idx] = nuVals[idx]))
    onChange(values)
  }

  function MaterialAssignmentEntry(index) {
    const assignment = values[index]
    function setAssignmentProperty(prop) {
      return (value) => {
        assignment[prop] = value
        onChangeAssignment(assignment, index)
      }
    }

    function onChangeMaterialID(value) {
      clearTexturePaths(assignment.args, index)
      delete assignment.args
      assignment.materialID = value
      onChangeAssignment(assignment, index)
    }

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
              value={assignment.materialID}
              onChange={onChangeMaterialID}
            />
          </InputGroup>
          <InputGroup
            key={`${entity}-${index}-patternTarget`}
            name={`Pattern Target`}
            label={t('editor:properties.materialAssignment.lbl-patternTarget')}
          >
            <SelectInput
              value={assignment.patternTarget}
              onChange={setAssignmentProperty('patternTarget')}
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
            <StringInput value={assignment.pattern as string} onChange={setAssignmentProperty('pattern')} />
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
