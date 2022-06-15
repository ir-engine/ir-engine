import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Color, MathUtils, Texture } from 'three'

import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { DefaultArguments, MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { PatternTarget } from '@xrengine/engine/src/renderer/materials/MaterialParms'
import { MaterialOverrideComponent } from '@xrengine/engine/src/scene/components/MaterialOverrideComponent'
import { refreshMaterials } from '@xrengine/engine/src/scene/functions/loaders/MaterialOverrideFunctions'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Collapse, IconButton, IconButtonProps, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'

import { AssetLoader } from '../../../../engine/src/assets/classes/AssetLoader'
import BooleanInput from './BooleanInput'
import { Button } from './Button'
import ColorInput from './ColorInput'
import CompoundNumericInput from './CompoundNumericInput'
import { ImageInput } from './ImageInput'
import InputGroup, { InputGroupContent, InputGroupVerticalContainerWide, InputGroupVerticalContent } from './InputGroup'
import NumericInput from './NumericInput'
import SelectInput from './SelectInput'
import StringInput, { ControlledStringInput } from './StringInput'

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}))

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

const ImageContainer = (styled as any).div`
  display: flex;
  width: 100%;
  border-width: 2px;
  border: solid;
  border-color: #FFFFFF;
  margin: 8px;
  padding: 4px;
`

const GroupContainer = (styled as any).label`
  background-color: transparent;
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

  function handleExpandClick(index) {
    return () => {
      const _expanded = new Map(expanded.entries())
      const key = texKey(index, 'expanded')
      const val = expanded.get(key)!
      _expanded.set(key, !val)
      setExpanded(_expanded)
    }
  }

  const { t } = useTranslation()

  function onChangeSize(text) {
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
          args: {},
          patternTarget: PatternTarget.OBJ3D,
          pattern: '~',
          uuid: MathUtils.generateUUID()
        })
      }
    preCount = count
    onChange(values)
  }

  function onRemoveEntry(idx) {
    return () => {
      const removing = values[idx]
      clearTexturePaths(removing, idx)
      values.splice(idx, 1)
      if (removing.entity > -1) removeComponent(removing.entity, MaterialOverrideComponent)
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
    await Promise.all(
      [...texturePaths.entries()].map(async ([assignmentKey, path]) => {
        const [_, uuid, prop] = /(.*)\-([\d\w]*)/.exec(assignmentKey)!
        const assignment = (values as any[]).find((val) => val.uuid === uuid)
        if (!assignment) return
        if (assignment.args === undefined) {
          assignment.args = {}
        }
        if (path !== '') assignment.args[prop] = await AssetLoader.loadAsync(path)
      })
    )
    const nuVals = await refreshMaterials(node.entity)
    values.forEach((_, idx) => (values[idx] = nuVals[idx]))
    onChange(values)
  }

  function MaterialAssignmentEntry(index) {
    const assignment = modelComponent.materialOverrides[index]
    function setAssignmentProperty(prop) {
      return (value) => {
        assignment[prop] = value
        onChangeAssignment(assignment, index)
      }
    }

    function getArguments(materialID) {
      const argStructure = assignment.args
        ? { ...DefaultArguments[materialID], ...assignment.args }
        : DefaultArguments[materialID]

      function setArgsProp(prop) {
        return (value) => {
          if (!assignment.args) assignment.args = argStructure
          assignment.args[prop] = value
          onChange(values)
        }
      }

      function setArgArrayProp(prop, arrayIndex) {
        return (value) => {
          if (!assignment.args) assignment.args = argStructure
          assignment.args[prop][arrayIndex] = value
          onChange(values)
        }
      }

      if (argStructure === undefined) {
        console.warn('no default arguments detected for material ' + materialID)
        return (
          <div>
            <p>No Arguments Detected</p>
          </div>
        )
      }

      function traverseArgs(args) {
        const id = `${entity}-${index}-args`
        const _expanded = expanded.get(texKey(index, 'expanded'))!
        return (
          <Fragment key={id}>
            <Box sx={{ color: '#fff', marginTop: '4px', marginBottom: '4px' }}>
              <ExpandMore
                expand={_expanded}
                onClick={handleExpandClick(index)}
                aria-expanded={_expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
              <label>Arguments</label>
            </Box>
            <Collapse in={_expanded} timeout="auto" unmountOnExit>
              {Object.entries(args).map(([k, v]) => {
                let compKey = `${entity}-${index}-args-${k}`
                //number
                if (typeof v === 'number') {
                  return (
                    <InputGroup key={compKey} name={k} label={k}>
                      <CompoundNumericInput value={v} onChange={setArgsProp(k)} min={-1000} max={1000} step={0.1} />
                    </InputGroup>
                  )
                }
                if ((v as Color).isColor) {
                  return (
                    <InputGroup key={compKey} name={k} label={k}>
                      <ColorInput value={v} onChange={setArgsProp(k)} />
                    </InputGroup>
                  )
                }
                if (typeof v === 'object') {
                  if ((v as any[]).length !== undefined)
                    return (
                      <InputGroup key={compKey} name={k} label={k}>
                        {(v as number[]).map((arrayVal, idx) => {
                          return (
                            <NumericInput
                              key={`${compKey}-${idx}`}
                              value={arrayVal}
                              onChange={setArgArrayProp(k, idx)}
                            />
                          )
                        })}
                      </InputGroup>
                    )
                }
                if (typeof v === 'string') {
                  return (
                    <InputGroup key={compKey} name={k} label={k}>
                      <StringInput value={v} onChange={setArgsProp(k)} />
                    </InputGroup>
                  )
                }
                if (typeof v === 'boolean') {
                  return (
                    <InputGroup key={compKey} name={k} label={k}>
                      <BooleanInput value={v} onChange={setArgsProp(k)} />
                    </InputGroup>
                  )
                }
                if ((v as Texture).isTexture) {
                  const argKey = texKey(index, k)
                  function onChangeTexturePath() {
                    return (value) => {
                      const nuPaths = new Map(texturePaths.entries())
                      nuPaths.set(argKey, value)
                      setTexturePaths(nuPaths)
                      if (assignment.args === undefined) assignment.args = argStructure
                      onChange(values)
                    }
                  }
                  return (
                    <InputGroup key={compKey} name={k} label={k}>
                      <ImageContainer>
                        <Stack>
                          <ImageInput value={texturePaths.get(argKey)} onChange={onChangeTexturePath()} />
                          <img src={texturePaths.get(argKey)} />
                        </Stack>
                      </ImageContainer>
                    </InputGroup>
                  )
                }
              })}
            </Collapse>
          </Fragment>
        )
      }
      return traverseArgs(argStructure)
    }

    function onChangeMaterialID(value) {
      clearTexturePaths(assignment.args, index)
      delete assignment.args
      assignment.materialID = value
      onChangeAssignment(assignment, index)
    }

    return (
      <Fragment key={`${entity}-${index}-entry`}>
        <span>
          <InputGroup
            key={`${entity}-${index}-materialID`}
            name="Material ID"
            label={t('editor:properties.materialAssignment.lbl-materialID')}
          >
            <SelectInput
              error={t('editor:properties.materialAssignment.error-materialID')}
              placeholder={t('editor:properties.materialAssignment.placeholder-materialID')}
              value={assignment.materialID}
              onChange={onChangeMaterialID}
              options={materialIDs}
              creatable={false}
              isSearchable={true}
            />
          </InputGroup>

          {getArguments(assignment.materialID)}

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
            <StringInput value={assignment.pattern} onChange={setAssignmentProperty('pattern')} />
          </InputGroup>
        </span>
        <div>
          <Button onClick={onRemoveEntry(index)} style={{ background: '#a21' }}>
            Delete
          </Button>
        </div>
      </Fragment>
    )
  }

  return (
    <GroupContainer>
      <div style={{ textAlign: 'center', color: '#fff', marginTop: '16px', marginBottom: '4px' }}>
        <Typography>Material Overrides</Typography>
      </div>
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
          <ArrayInputGroupContent>
            <label> Count: </label>
            <ControlledStringInput value={count} onChange={onChangeSize} />
            <Button onClick={onAddEntry}>+</Button>
          </ArrayInputGroupContent>
          {values &&
            values.map((value, idx) => {
              return (
                <ArrayInputGroupContent key={`${entity}-${idx}-overrideEntry`} style={{ margin: '4px 2px' }}>
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
