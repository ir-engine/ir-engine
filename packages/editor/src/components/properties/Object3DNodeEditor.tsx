import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import ReactJson from 'react-json-view'
import { Euler, InstancedMesh, Material, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from 'three'

import { AxisIcon } from '@xrengine/client-core/src/util/AxisIcon'
import { Deg2Rad, Rad2Deg } from '@xrengine/common/src/utils/mathUtils'

import InputGroup from '../inputs/InputGroup'
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

  const obj3d: Object3D = props.node as any
  const mesh: Mesh = obj3d as Mesh
  const isMesh = mesh.isMesh
  const instancedMesh = mesh as InstancedMesh
  const isInstancedMesh = instancedMesh.isInstancedMesh

  // initializing iconComponent icon name
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
                return result.map((material) => {
                  return (
                    <div>
                      <p>Name: {material.name}</p>
                      <br />
                      <p>Parameters:</p>
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
                    <Vector3Input value={new Vector3(euler.x, euler.y, euler.z).multiplyScalar(Rad2Deg())} />
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
