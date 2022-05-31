import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { PatternTarget } from '@xrengine/engine/src/renderer/materials/MaterialParms'
import {
  MaterialOverrideComponent,
  MaterialOverrideComponentType
} from '@xrengine/engine/src/scene/components/MaterialOverrideComponent'
import { refreshMaterials } from '@xrengine/engine/src/scene/functions/loaders/MaterialOverrideFunctions'

import { Button } from './Button'
import InputGroup, { InputGroupContent, InputGroupVerticalContainerWide, InputGroupVerticalContent } from './InputGroup'
import SelectInput from './SelectInput'
import StringInput, { ControlledStringInput } from './StringInput'

const GroupContainer = (styled as any).label`
  background-color: $transparent;
  color: #9FA4B5;
  white-space: pre-wrap;
  padding: 0 8px 8px;
`

const ArrayInputGroupContent = (styled as any)(InputGroupContent)`
  margin: 4px 0px;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}`
/*
  & > label {
    max-width: 33.33333% !important;
  }
  & > input {
    max-width: 66.66666% !important;
  }
  & > div {
    max-width: 66.66666% !important;
  }
`*/

export default function MaterialAssignment({ entity, node, modelComponent, values, onChange }) {
  let [count, setCount] = useState(values.length)

  let [materialIDs, setMaterialIDs] = useState<any[]>(
    Object.keys(MaterialLibrary).map((k) => {
      return { label: k, value: k }
    })
  )
  const { t } = useTranslation()

  function onChangeSize(text, values, onChange) {
    const count = parseInt(text)
    let preCount = 0
    if (!values) values = []
    else preCount = values.length
    if (count == undefined || preCount == count) return
    if (preCount > count) values.splice(count)
    else
      for (let i = 0; i < count - preCount; i++) {
        values.push({
          entity: -1,
          targetEntity: node.entity,
          materialID: '',
          patternTarget: PatternTarget.OBJ3D,
          pattern: ''
        })
      }
    preCount = count
    onChange(values)
  }

  function onRemoveEntry(idx, values: any[], setCount, onChange) {
    return () => {
      const [removing] = values.splice(idx, 1) as MaterialOverrideComponentType[]
      removeComponent(removing.entity, MaterialOverrideComponent)
      setCount(values.length)
      onChange(values)
    }
  }

  function onAddEntry(values: any[], setCount, onChange) {
    return () => {
      setCount(values.length + 1)
      onChangeSize(`${values.length + 1}`, values, onChange)
    }
  }

  function onChangeAssignment(assignment, index, values, onChange) {
    values[index] = assignment
    onChange(values)
  }

  function onRefresh(onChange) {
    return async () => {
      await refreshMaterials(node.entity)
      onChange(modelComponent.materialOverrides)
    }
  }

  function MaterialAssignmentEntry(index) {
    const assignment = modelComponent.materialOverrides[index]
    function setAssignmentProperty(prop) {
      return (value) => {
        assignment[prop] = value
        onChangeAssignment(assignment, index, values, onChange)
      }
    }

    return (
      <div>
        <span>
          <InputGroup name="Material ID" label={t('editor:properties.materialAssignment.lbl-materialID')}>
            <SelectInput
              key={`${entity}-${index}-materialID`}
              error={t('editor:properties.materialAssignment.error-materialID')}
              placeholder={t('editor:properties.materialAssignment.placeholder-materialID')}
              value={assignment.materialID}
              onChange={setAssignmentProperty('materialID')}
              options={materialIDs}
            />
          </InputGroup>
          <InputGroup name="Pattern Target" label={t('editor:properties.materialAssignment.lbl-patternTarget')}>
            <SelectInput
              key={`${entity}-${index}-patternTarget`}
              value={assignment.patternTarget}
              onChange={setAssignmentProperty('patternTarget')}
              options={[
                { label: 'Object3D Name', value: PatternTarget.OBJ3D },
                { label: 'Mesh Name', value: PatternTarget.MESH },
                { label: 'Material Name', value: PatternTarget.MATERIAL }
              ]}
            />
          </InputGroup>
          <InputGroup name="Pattern" label={t('editor:properties.materialAssignment.lbl-pattern')}>
            <StringInput value={assignment.pattern} onChange={setAssignmentProperty('pattern')} />
          </InputGroup>
        </span>
        <span>
          <Button onClick={onRemoveEntry(index, values, setCount, onChange)}>Delete</Button>
        </span>
      </div>
    )
  }

  return (
    <GroupContainer>
      <InputGroupVerticalContainerWide>
        <InputGroupVerticalContent>
          <Button onClick={onRefresh(onChange)}>
            <p>Refresh</p>
          </Button>
          <ArrayInputGroupContent>
            <label> Count: </label>
            <ControlledStringInput value={count} onChange={(text) => onChangeSize(text, values, onChange)} />
            <Button onClick={onAddEntry(values, setCount, onChange)}>+</Button>
          </ArrayInputGroupContent>
          {values &&
            values.map((value, idx) => {
              return (
                <ArrayInputGroupContent key={`${entity}-${idx}`} style={{ margin: '4px 2px' }}>
                  <label>{idx + 1}: </label>
                  {MaterialAssignmentEntry(idx)}
                </ArrayInputGroupContent>
              )
            })}
        </InputGroupVerticalContent>
      </InputGroupVerticalContainerWide>
    </GroupContainer>
  )
}
