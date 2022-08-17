import { suspendHookstate } from '@hookstate/core'
import React, { Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactJson from 'react-json-view'
import {
  Color,
  CompressedTexture,
  Euler,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Texture,
  Vector3
} from 'three'

import { AxisIcon } from '@xrengine/client-core/src/util/AxisIcon'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@xrengine/engine/src/assets/functions/createReadableTexture'
import { Deg2Rad, Rad2Deg } from '@xrengine/engine/src/common/functions/MathFunctions'
import { dispatchAction, useHookEffect, useHookstate } from '@xrengine/hyperflux'

import EditorCommands from '../../constants/EditorCommands'
import { EditorAction } from '../../services/EditorServices'
import { SelectionAction } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import Vector3Input from '../inputs/Vector3Input'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import { List } from '../layout/List'
import Well from '../layout/Well'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * Object3DNodeEditor component used to provide the editor view to customize Object3D properties inside a model.
 *
 * @type {Class component}
 */
export const Object3DNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  console.log(props)

  const onEdit = (edit) => {
    console.log(edit)
  }

  const thumbnails = useHookstate(new Map<Object, string>())
  const obj3d: Object3D = props.node as any
  const objId = useHookstate(obj3d.uuid)
  useEffect(() => {
    if (obj3d && obj3d.uuid !== objId.value) {
      objId.set(obj3d.uuid)
    }
  })
  const mesh: Mesh = obj3d as Mesh
  const isMesh = mesh.isMesh
  const instancedMesh = mesh as InstancedMesh
  const isInstancedMesh = instancedMesh.isInstancedMesh

  const updateObj3d = (varName: 'frustrumCulled' | 'visible' | 'castShadow' | 'receiveShadow', label) => {
    const varVal = useHookstate(() => obj3d[varName])
    return (
      <InputGroup name={label} label={label}>
        <BooleanInput
          value={varVal['value']}
          onChange={(val) => {
            obj3d[varName] = val
            varVal.set(val)
          }}
        />
      </InputGroup>
    )
  }
  const clearThumbs = () => {
    ;[...thumbnails.value.values()].map(URL.revokeObjectURL)
    thumbnails.value.clear()
    thumbnails.set(new Map())
  }
  //cleanup
  useHookEffect(() => {
    if (isMesh) {
      const mats: Material[] = []
      if ((mesh.material as Material[]).length !== undefined) {
        ;(mesh.material as Material[]).map((material) => mats.push(material))
      } else {
        mats.push(mesh.material as Material)
      }
      mats.map((mat) =>
        Object.values(mat).map((field: Texture) => {
          if (field?.isTexture) {
            const txr = createReadableTexture(field as CompressedTexture, { width: 256, height: 256 })
            const dataUrl = txr.source.data.getContext('webgl2').canvas.toDataURL()
            thumbnails.set(thumbnails.value.set(field, dataUrl))
          }
        })
      )
    }
    return clearThumbs
  }, [objId])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.object3d.name')}
      description={t('editor:properties.object3d.description')}
    >
      {/* <InputGroup name="Cube Map" label={t('editor:properties.interior.lbl-cubeMap')}>
        <ImageInput value={interiorComponent.cubeMap} onChange={updateProperty(InteriorComponent, 'cubeMap')} />
        {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.interior.error-url')}</div>}
      </InputGroup> */}
      {/* <StringInput value={name} onChange={setName} onFocus={onFocus} onBlur={onBlurName} onKeyUp={onKeyUpName} /> */}
      {/* frustrum culling */ updateObj3d('frustrumCulled', 'Frustrum Culled')}
      {/* visibility */ updateObj3d('visible', 'Visible')}
      {
        /* cast / receive shadows */
        <Well>
          {updateObj3d('castShadow', 'Cast Shadow')}
          {updateObj3d('receiveShadow', 'Receive Shadow')}
        </Well>
      }
      {/* animations */}
      {isMesh && (
        <CollapsibleBlock label={'Mesh Properties'}>
          <CollapsibleBlock label={'Materials'}>
            <List>
              {(() => {
                const result: Material[] = []
                if ((mesh.material as Material[]).length !== undefined) {
                  ;(mesh.material as Material[]).map((material) => result.push(material))
                } else {
                  result.push(mesh.material as Material)
                }
                return result.map((material: MeshBasicMaterial & MeshMatcapMaterial & MeshStandardMaterial) => {
                  const defaults: any = {}
                  Object.entries(material).map(([k, v]) => {
                    if ((v as Texture)?.isTexture) {
                      defaults[k] = { type: 'texture', preview: thumbnails.value.get(v)! }
                    } else if ((v as Color)?.isColor) {
                      defaults[k] = { type: 'color' }
                    } else if (typeof v === 'number') {
                      defaults[k] = { type: 'float' }
                    }
                  })
                  return (
                    <div>
                      <p>Name: {material.name}</p>
                      <br />
                      <p>Parameters:</p>
                      <ParameterInput
                        entity={obj3d.uuid}
                        values={material}
                        onChange={(k) => async (val) => {
                          if (defaults[k].type === 'texture' && typeof val === 'string') {
                            const nuTxr: Texture = await AssetLoader.loadAsync(val)
                            material[k] = nuTxr
                            delete defaults[k].preview
                          }
                          material.needsUpdate = true
                        }}
                        defaults={defaults}
                      />
                    </div>
                  )
                })
              })()}
            </List>
          </CollapsibleBlock>
        </CollapsibleBlock>
      )}

      {isInstancedMesh && (
        <CollapsibleBlock label={'Instance Properties'}>
          <List>
            {Array.from({ length: instancedMesh.instanceMatrix.count }, (_, i) => i).map((i) => {
              let transform = new Matrix4()
              instancedMesh.getMatrixAt(i, transform)
              let position = new Vector3()
              let rotation = new Quaternion()
              let scale = new Vector3()
              transform.decompose(position, rotation, scale)

              const euler = new Euler()
              euler.setFromQuaternion(rotation)
              return (
                <Well>
                  <InputGroup name="Position" label="Translation">
                    <Vector3Input value={position} />
                  </InputGroup>
                  <InputGroup name="Rotation" label="Rotation">
                    <Vector3Input value={new Vector3(euler.x, euler.y, euler.z).multiplyScalar(Rad2Deg)} />
                  </InputGroup>
                  <InputGroup name="Scale" label="Scale">
                    <Vector3Input value={scale} />
                  </InputGroup>
                </Well>
              )
            })}
          </List>
        </CollapsibleBlock>
      )}
      <ReactJson
        style={{ height: '100%', overflow: 'auto' }}
        onEdit={onEdit}
        theme="monokai"
        src={(props.node as any as Object3D).userData}
      />
    </NodeEditor>
  )
}

Object3DNodeEditor.iconComponent = AxisIcon

export default Object3DNodeEditor
