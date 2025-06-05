/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { iterateEntityNode } from '@ir-engine/ecs'
import { getOptionalComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { PoiComponent } from '@ir-engine/engine/src/scene/components/PoiComponent'
import { CameraMode, CameraScrollBehavior, PoiScrollTransition } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { HiOutlineCamera } from 'react-icons/hi'
import { Box3, Vector3 } from 'three'
import Button from '../../../../primitives/tailwind/Button'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import Label from '../../../../primitives/tailwind/Label'
import EntityListInput from '../../input/EntityList'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

/** Types copied from Camera Modes of engine. */
const projectionTypeSelect = [
  {
    label: 'Orthographic',
    value: 0
  },
  {
    label: 'Perspective',
    value: 1
  }
]

const modelQuery = defineQuery([GLTFComponent])
const _box3 = new Box3()

export const CameraPropertiesNodeEditor: EditorComponentType = (props) => {
  const cameraSettings = useComponent(props.entity, CameraSettingsComponent)
  const { t } = useTranslation()

  const calculateClippingPlanes = () => {
    const box = new Box3()
    const modelEntities = modelQuery()
    for (const entity of modelEntities) {
      iterateEntityNode(entity, (entity) => {
        const mesh = getOptionalComponent(entity, MeshComponent)
        if (mesh?.geometry?.boundingBox) {
          _box3.copy(mesh.geometry.boundingBox)
          _box3.applyMatrix4(mesh.matrixWorld)
          box.union(_box3)
        }
      })
    }
    const boxSize = box.getSize(new Vector3()).length()
    commitProperties(
      CameraSettingsComponent,
      {
        cameraNearClip: 0.1,
        cameraFarClip: Math.max(boxSize, 100)
      },
      [props.entity]
    )
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.cameraSettings.name')}
      description={t('editor:properties.cameraSettings.description')}
      Icon={CameraPropertiesNodeEditor.iconComponent}
      entity={props.entity}
    >
      <InputGroup name="Projection type" label={t('editor:properties.cameraSettings.lbl-projectionType')}>
        <SelectInput
          // placeholder={projectionTypeSelect[0].label}
          value={cameraSettings.projectionType.value}
          onChange={commitProperty(CameraSettingsComponent, 'projectionType')}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Field of view" label={t('editor:properties.cameraSettings.lbl-fov')}>
        <NumericInput
          onChange={updateProperty(CameraSettingsComponent, 'fov')}
          onRelease={commitProperty(CameraSettingsComponent, 'fov')}
          min={1}
          max={180}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={cameraSettings.fov.value}
        />
      </InputGroup>
      <div className="my-1 flex flex-wrap items-center justify-end">
        <Button className="flex flex-wrap items-center justify-end" onClick={calculateClippingPlanes}>
          {t('editor:properties.cameraSettings.lbl-calcClippingPlanes') as string}
        </Button>
      </div>

      <InputGroup
        name="cameraClippingPlanes"
        label={t('editor:properties.cameraSettings.lbl-clippingPlanes')}
        containerClassName="gap-2"
      >
        <div className="flex w-full flex-col gap-2 border-[0.5px] border-[#42454D] pb-1 pl-4 pr-4 pt-1">
          <InputGroup
            name="Near"
            label={t('editor:properties.cameraSettings.lbl-nearClip')}
            className="w-2/3 flex-grow"
          >
            <div className="flex w-full items-center gap-2">
              <NumericInput
                onChange={updateProperty(CameraSettingsComponent, 'cameraNearClip')}
                onRelease={commitProperty(CameraSettingsComponent, 'cameraNearClip')}
                min={0.001}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={cameraSettings.cameraNearClip.value}
                className="flex w-full flex-grow"
              />
            </div>
          </InputGroup>
          <InputGroup name="Far" label={t('editor:properties.cameraSettings.lbl-farClip')} className="w-2/3 flex-grow">
            <div className="flex w-full items-center gap-2">
              <NumericInput
                onChange={updateProperty(CameraSettingsComponent, 'cameraFarClip')}
                onRelease={commitProperty(CameraSettingsComponent, 'cameraFarClip')}
                min={0.001}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={cameraSettings.cameraFarClip.value}
                className="flex w-full flex-grow"
              />
            </div>
          </InputGroup>
        </div>
      </InputGroup>

      {/*<InputGroup name="minPhi" label={t('editor:properties.cameraSettings.lbl-phi')} containerClassName="gap-2">*/}
      {/*  <div className="flex gap-2">*/}
      {/*    <NumericInput*/}
      {/*      onChange={updateProperty(CameraSettingsComponent, 'minPhi')}*/}
      {/*      onRelease={commitProperty(CameraSettingsComponent, 'minPhi')}*/}
      {/*      min={0.001}*/}
      {/*      smallStep={0.001}*/}
      {/*      mediumStep={0.01}*/}
      {/*      largeStep={0.1}*/}
      {/*      value={cameraSettings.minPhi.value}*/}
      {/*      className="w-1/2"*/}
      {/*    />*/}
      {/*    <NumericInput*/}
      {/*      onChange={updateProperty(CameraSettingsComponent, 'maxPhi')}*/}
      {/*      onRelease={commitProperty(CameraSettingsComponent, 'maxPhi')}*/}
      {/*      min={0.001}*/}
      {/*      smallStep={0.001}*/}
      {/*      mediumStep={0.01}*/}
      {/*      largeStep={0.1}*/}
      {/*      value={cameraSettings.maxPhi.value}*/}
      {/*      className="w-1/2"*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</InputGroup>*/}

      {/* Camera Mode*/}
      <InputGroup name="cameraMode" label={t('editor:properties.cameraSettings.lbl-cameraMode')}>
        <SelectInput
          value={cameraSettings.cameraMode.value}
          onChange={commitProperty(CameraSettingsComponent, 'cameraMode')}
          options={[
            { label: 'FOLLOW', value: CameraMode.FOLLOW },
            { label: 'POI', value: CameraMode.POI }
          ]}
        />
      </InputGroup>

      {/* DIRECT Camera Mode Settings */}
      {cameraSettings.cameraMode.value === CameraMode.FOLLOW && (
        <>
          <InputGroup name="avatar" label={t('editor:properties.cameraSettings.lbl-avatar')}>
            <Checkbox
              label={t('editor:properties.cameraSettings.lbl-avatarVisible')}
              variantTextPlacement={'right'}
              checked={cameraSettings.isAvatarVisible.value}
              onChange={commitProperty(CameraSettingsComponent, 'isAvatarVisible')}
            />
          </InputGroup>
          <InputGroup name="avatar" label={t('editor:properties.cameraSettings.lbl-scrollingSpeed')}>
            <NumericInput
              onChange={updateProperty(CameraSettingsComponent, 'followCameraScrollSensitivity')}
              onRelease={commitProperty(CameraSettingsComponent, 'followCameraScrollSensitivity')}
              min={0.001}
              smallStep={0.001}
              mediumStep={0.01}
              largeStep={0.1}
              value={cameraSettings.followCameraScrollSensitivity.value}
              className="flex w-full flex-grow"
            />
          </InputGroup>

          <InputGroup name="direstCameraModes" label={t('editor:properties.cameraSettings.lbl-followCameraModes')}>
            <Checkbox
              label={t('editor:properties.cameraSettings.lbl-followCameraFristPerson')}
              variantTextPlacement={'right'}
              checked={cameraSettings.canCameraFirstPerson.value}
              onChange={commitProperty(CameraSettingsComponent, 'canCameraFirstPerson')}
            />
            <Checkbox
              label={t('editor:properties.cameraSettings.lbl-followCameraThirdPerson')}
              variantTextPlacement={'right'}
              checked={cameraSettings.canCameraThirdPerson.value}
              onChange={commitProperty(CameraSettingsComponent, 'canCameraThirdPerson')}
            />
            <Checkbox
              label={t('editor:properties.cameraSettings.lbl-followCameraTopDown')}
              variantTextPlacement={'right'}
              checked={cameraSettings.canCameraTopDown.value}
              onChange={commitProperty(CameraSettingsComponent, 'canCameraTopDown')}
            />
            {!cameraSettings.canCameraFirstPerson.value &&
              !cameraSettings.canCameraThirdPerson.value &&
              !cameraSettings.canCameraTopDown.value && (
                <Label className="text-text-error">{t('editor:properties.cameraSettings.lbl-followCameraError')}</Label>
              )}
          </InputGroup>
          {cameraSettings.canCameraFirstPerson.value && (
            <InputGroup name="cameraFirstPerson" label={t('editor:properties.cameraSettings.lbl-firstPersonSettings')}>
              <div className="flex w-full flex-col gap-2 border-[0.5px] border-[#42454D] pb-1 pl-4 pr-4 pt-1">
                <Checkbox
                  label={t('editor:properties.cameraSettings.lbl-freeCamera')}
                  variantTextPlacement={'right'}
                  checked={cameraSettings.isFistPersonFreeCamera.value}
                  onChange={commitProperty(CameraSettingsComponent, 'isFistPersonFreeCamera')}
                />
                {cameraSettings.isFistPersonFreeCamera.value && (
                  <InputGroup
                    name="defaultDistance"
                    label={t('editor:properties.cameraSettings.lbl-cameraLimits')}
                    className="w-2/3 flex-grow"
                  >
                    <div className="flex w-full items-center gap-2">
                      <NumericInput
                        onChange={(val) => {
                          val = Math.min(Math.max(val, 0), 360)
                          updateProperty(CameraSettingsComponent, 'firstPersonCameraLimits')(val)
                        }}
                        onRelease={(val) => {
                          val = Math.min(Math.max(val, 0), 360)
                          commitProperty(CameraSettingsComponent, 'firstPersonCameraLimits')(val)
                        }}
                        min={0.001}
                        smallStep={0.001}
                        mediumStep={0.01}
                        largeStep={0.1}
                        value={cameraSettings.firstPersonCameraLimits.value}
                        className="flex w-full flex-grow"
                      />
                    </div>
                  </InputGroup>
                )}
                <Checkbox
                  label={t('editor:properties.cameraSettings.lbl-cameraReset')}
                  variantTextPlacement={'right'}
                  checked={cameraSettings.isFirstPersonCameraReset.value}
                  onChange={commitProperty(CameraSettingsComponent, 'isFirstPersonCameraReset')}
                />
              </div>
            </InputGroup>
          )}
          {cameraSettings.canCameraThirdPerson.value && (
            <InputGroup name="cameraThirdPerson" label={t('editor:properties.cameraSettings.lbl-thirdPersonSettings')}>
              <div className="flex w-full flex-col gap-2 border-[0.5px] border-[#42454D] pb-1 pl-4 pr-4 pt-1">
                <InputGroup
                  name="ThirdPersonMinDistance"
                  label={t('editor:properties.cameraSettings.lbl-minCamDist')}
                  className="w-2/3 flex-grow"
                >
                  <NumericInput
                    onChange={(val) => {
                      val = Math.min(val, cameraSettings.thirdPersonDefaultDistance.value)
                      updateProperty(CameraSettingsComponent, 'thirdPersonMinDistance')(val)
                    }}
                    onRelease={(val) => {
                      val = Math.min(val, cameraSettings.thirdPersonDefaultDistance.value)
                      commitProperty(CameraSettingsComponent, 'thirdPersonMinDistance')(val)
                    }}
                    min={0.001}
                    smallStep={0.001}
                    mediumStep={0.01}
                    largeStep={0.1}
                    value={cameraSettings.thirdPersonMinDistance.value}
                    className="flex w-full flex-grow"
                  />
                </InputGroup>
                <InputGroup
                  name="Max"
                  label={t('editor:properties.cameraSettings.lbl-maxCamDist')}
                  className="w-2/3 flex-grow"
                >
                  <NumericInput
                    onChange={(val) => {
                      val = Math.max(val, cameraSettings.thirdPersonDefaultDistance.value)
                      updateProperty(CameraSettingsComponent, 'thirdPersonMaxDistance')(val)
                    }}
                    onRelease={(val) => {
                      val = Math.max(val, cameraSettings.thirdPersonDefaultDistance.value)
                      commitProperty(CameraSettingsComponent, 'thirdPersonMaxDistance')(val)
                    }}
                    min={0.001}
                    smallStep={0.001}
                    mediumStep={0.01}
                    largeStep={0.1}
                    value={cameraSettings.thirdPersonMaxDistance.value}
                    className="flex w-full flex-grow"
                  />
                </InputGroup>

                <InputGroup
                  name="defaultDistance"
                  label={t('editor:properties.cameraSettings.lbl-defaultDistance')}
                  className="w-2/3 flex-grow"
                >
                  <div className="flex w-full items-center gap-2">
                    <NumericInput
                      onChange={(val) => {
                        if (val < cameraSettings.thirdPersonMinDistance.value) {
                          val = cameraSettings.thirdPersonMinDistance.value
                        }
                        if (val > cameraSettings.thirdPersonMaxDistance.value) {
                          val = cameraSettings.thirdPersonMaxDistance.value
                        }
                        updateProperty(CameraSettingsComponent, 'thirdPersonDefaultDistance')(val)
                      }}
                      onRelease={(val) => {
                        if (val < cameraSettings.thirdPersonMinDistance.value) {
                          val = cameraSettings.thirdPersonMinDistance.value
                        }
                        if (val > cameraSettings.thirdPersonMaxDistance.value) {
                          val = cameraSettings.thirdPersonMaxDistance.value
                        }
                        commitProperty(CameraSettingsComponent, 'thirdPersonDefaultDistance')(val)
                      }}
                      min={0.001}
                      smallStep={0.001}
                      mediumStep={0.01}
                      largeStep={0.1}
                      value={cameraSettings.thirdPersonDefaultDistance.value}
                      className="flex w-full flex-grow"
                    />
                  </div>
                </InputGroup>
                <Checkbox
                  label={t('editor:properties.cameraSettings.lbl-freeCamera')}
                  variantTextPlacement={'right'}
                  checked={cameraSettings.isThirdPersonFreeCamera.value}
                  onChange={commitProperty(CameraSettingsComponent, 'isThirdPersonFreeCamera')}
                />
                {cameraSettings.isThirdPersonFreeCamera.value && (
                  <InputGroup
                    name="defaultDistance"
                    label={t('editor:properties.cameraSettings.lbl-cameraLimits')}
                    className="w-2/3 flex-grow"
                  >
                    <div className="flex w-full items-center gap-2">
                      <NumericInput
                        onChange={(val) => {
                          val = Math.min(Math.max(val, 0), 360)
                          updateProperty(CameraSettingsComponent, 'thirdPersonCameraLimits')(val)
                        }}
                        onRelease={(val) => {
                          val = Math.min(Math.max(val, 0), 360)
                          commitProperty(CameraSettingsComponent, 'thirdPersonCameraLimits')(val)
                        }}
                        min={0.001}
                        smallStep={0.001}
                        mediumStep={0.01}
                        largeStep={0.1}
                        value={cameraSettings.thirdPersonCameraLimits.value}
                        className="flex w-full flex-grow"
                      />
                    </div>
                  </InputGroup>
                )}
                <Checkbox
                  label={t('editor:properties.cameraSettings.lbl-cameraReset')}
                  variantTextPlacement={'right'}
                  checked={cameraSettings.isThirdPersonCameraReset.value}
                  onChange={commitProperty(CameraSettingsComponent, 'isThirdPersonCameraReset')}
                />
              </div>
            </InputGroup>
          )}
          {cameraSettings.canCameraTopDown.value && (
            <InputGroup name="cameraTopDown" label={t('editor:properties.cameraSettings.lbl-topDownSettings')}>
              <div className="flex w-full flex-col gap-2 border-[0.5px] border-[#42454D] pb-1 pl-4 pr-4 pt-1">
                <InputGroup
                  name="ThirdPersonMinDistance"
                  label={t('editor:properties.cameraSettings.lbl-minCamDist')}
                  className="w-2/3 flex-grow"
                >
                  <NumericInput
                    onChange={(val) => {
                      val = Math.min(val, cameraSettings.topDownDefaultDistance.value)
                      updateProperty(CameraSettingsComponent, 'topDownMinDistance')(val)
                    }}
                    onRelease={(val) => {
                      val = Math.min(val, cameraSettings.topDownDefaultDistance.value)
                      commitProperty(CameraSettingsComponent, 'topDownMinDistance')(val)
                    }}
                    min={0.001}
                    smallStep={0.001}
                    mediumStep={0.01}
                    largeStep={0.1}
                    value={cameraSettings.topDownMinDistance.value}
                    className="flex w-full flex-grow"
                  />
                </InputGroup>
                <InputGroup
                  name="Max"
                  label={t('editor:properties.cameraSettings.lbl-maxCamDist')}
                  className="w-2/3 flex-grow"
                >
                  <NumericInput
                    onChange={(val) => {
                      val = Math.max(val, cameraSettings.topDownDefaultDistance.value)
                      updateProperty(CameraSettingsComponent, 'topDownMaxDistance')(val)
                    }}
                    onRelease={(val) => {
                      val = Math.max(val, cameraSettings.topDownDefaultDistance.value)
                      commitProperty(CameraSettingsComponent, 'topDownMaxDistance')(val)
                    }}
                    min={0.001}
                    smallStep={0.001}
                    mediumStep={0.01}
                    largeStep={0.1}
                    value={cameraSettings.topDownMaxDistance.value}
                    className="flex w-full flex-grow"
                  />
                </InputGroup>

                <InputGroup
                  name="defaultDistance"
                  label={t('editor:properties.cameraSettings.lbl-defaultDistance')}
                  className="w-2/3 flex-grow"
                >
                  <div className="flex w-full items-center gap-2">
                    <NumericInput
                      onChange={(val) => {
                        if (val < cameraSettings.topDownMinDistance.value) {
                          val = cameraSettings.topDownMinDistance.value
                        }
                        if (val > cameraSettings.topDownMaxDistance.value) {
                          val = cameraSettings.topDownMaxDistance.value
                        }
                        updateProperty(CameraSettingsComponent, 'topDownDefaultDistance')(val)
                      }}
                      onRelease={(val) => {
                        if (val < cameraSettings.topDownMinDistance.value) {
                          val = cameraSettings.topDownMinDistance.value
                        }
                        if (val > cameraSettings.topDownMaxDistance.value) {
                          val = cameraSettings.topDownMaxDistance.value
                        }
                        commitProperty(CameraSettingsComponent, 'topDownDefaultDistance')(val)
                      }}
                      min={0.001}
                      smallStep={0.001}
                      mediumStep={0.01}
                      largeStep={0.1}
                      value={cameraSettings.topDownDefaultDistance.value}
                      className="flex w-full flex-grow"
                    />
                  </div>
                </InputGroup>
                <Checkbox
                  label={t('editor:properties.cameraSettings.lbl-freeCamera')}
                  variantTextPlacement={'right'}
                  checked={cameraSettings.isTopDownFreeCamera.value}
                  onChange={commitProperty(CameraSettingsComponent, 'isTopDownFreeCamera')}
                />
                {cameraSettings.isTopDownFreeCamera.value && (
                  <InputGroup
                    name="defaultDistance"
                    label={t('editor:properties.cameraSettings.lbl-cameraLimits')}
                    className="w-2/3 flex-grow"
                  >
                    <div className="flex w-full items-center gap-2">
                      <NumericInput
                        onChange={(val) => {
                          val = Math.min(Math.max(val, 0), 360)
                          updateProperty(CameraSettingsComponent, 'topDownCameraLimits')(val)
                        }}
                        onRelease={(val) => {
                          val = Math.min(Math.max(val, 0), 360)
                          commitProperty(CameraSettingsComponent, 'topDownCameraLimits')(val)
                        }}
                        min={0.001}
                        smallStep={0.001}
                        mediumStep={0.01}
                        largeStep={0.1}
                        value={cameraSettings.topDownCameraLimits.value}
                        className="flex w-full flex-grow"
                      />
                    </div>
                  </InputGroup>
                )}
                <Checkbox
                  label={t('editor:properties.cameraSettings.lbl-cameraReset')}
                  variantTextPlacement={'right'}
                  checked={cameraSettings.isTopDownCameraReset.value}
                  onChange={commitProperty(CameraSettingsComponent, 'isTopDownCameraReset')}
                />
              </div>
            </InputGroup>
          )}
        </>
      )}

      {/* POI Camera Mode Settings */}
      {cameraSettings.cameraMode.value === CameraMode.POI && (
        <>
          <InputGroup name="poiEntities" label={t('editor:properties.cameraSettings.lbl-poiEntities', 'POI Entities')}>
            <EntityListInput
              value={Array.from(cameraSettings.poiEntities.value)}
              onChange={commitProperty(CameraSettingsComponent, 'poiEntities')}
              placeholder="Select entities to use as points of interest"
              filter={[PoiComponent]}
              className="w-full"
            />
          </InputGroup>

          <InputGroup
            name="poiLerpSpeed"
            label={t('editor:properties.cameraSettings.lbl-poiLerpSpeed', 'POI Transition Speed')}
          >
            <NumericInput
              onChange={updateProperty(CameraSettingsComponent, 'poiLerpSpeed')}
              onRelease={commitProperty(CameraSettingsComponent, 'poiLerpSpeed')}
              min={0.01}
              max={5}
              smallStep={0.01}
              mediumStep={0.1}
              largeStep={0.5}
              value={cameraSettings.poiLerpSpeed.value}
            />
          </InputGroup>

          <InputGroup
            name="scrollDeadzone"
            label={t('editor:properties.cameraSettings.lbl-scrollDeadzone', 'Scroll Deadzone')}
          >
            <NumericInput
              onChange={updateProperty(CameraSettingsComponent, 'scrollDeadzone')}
              onRelease={commitProperty(CameraSettingsComponent, 'scrollDeadzone')}
              min={0.1}
              max={2}
              smallStep={0.05}
              mediumStep={0.1}
              largeStep={0.2}
              value={cameraSettings.scrollDeadzone.value}
            />
          </InputGroup>

          <InputGroup
            name="scrollSensitivity"
            label={t('editor:properties.cameraSettings.lbl-scrollSensitivity', 'Scroll Sensitivity')}
          >
            <NumericInput
              onChange={updateProperty(CameraSettingsComponent, 'scrollSensitivity')}
              onRelease={commitProperty(CameraSettingsComponent, 'scrollSensitivity')}
              min={0.1}
              max={1}
              smallStep={0.05}
              mediumStep={0.1}
              largeStep={0.5}
              value={cameraSettings.scrollSensitivity.value}
            />
          </InputGroup>

          <InputGroup
            name="scrollDistancePerPoi"
            label={t('editor:properties.cameraSettings.lbl-scrollDistancePerPoi', 'Scroll Distance Per POI')}
          >
            <NumericInput
              onChange={updateProperty(CameraSettingsComponent, 'scrollDistancePerPoi')}
              onRelease={commitProperty(CameraSettingsComponent, 'scrollDistancePerPoi')}
              min={1}
              max={10}
              smallStep={0.1}
              mediumStep={0.5}
              largeStep={1}
              value={cameraSettings.scrollDistancePerPoi.value}
            />
          </InputGroup>

          <InputGroup
            name="scrollBehavior"
            label={t('editor:properties.cameraSettings.lbl-scrollBehavior', 'Scroll Behavior')}
          >
            <SelectInput
              value={cameraSettings.scrollBehavior.value}
              onChange={commitProperty(CameraSettingsComponent, 'scrollBehavior')}
              options={[
                { label: 'Wrap', value: CameraScrollBehavior.Wrap },
                { label: 'Clamp', value: CameraScrollBehavior.Clamp }
              ]}
            />
          </InputGroup>

          <InputGroup
            name="poiScrollTransitionType"
            label={t('editor:properties.cameraSettings.lbl-poiScrollTransitionType', 'POI Scroll Transition Type')}
          >
            <SelectInput
              value={cameraSettings.poiScrollTransitionType.value}
              onChange={commitProperty(CameraSettingsComponent, 'poiScrollTransitionType')}
              options={[
                { label: 'Scrolling', value: PoiScrollTransition.Scrolling },
                { label: 'Snapping', value: PoiScrollTransition.Snapping }
              ]}
            />
          </InputGroup>

          {cameraSettings.poiScrollTransitionType.value === PoiScrollTransition.Snapping && (
            <InputGroup
              name="enableTransitionButtons"
              label={t('editor:properties.cameraSettings.lbl-enableTransitionButtons', 'Enable Transition Buttons')}
            >
              <Checkbox
                label={t(
                  'editor:properties.cameraSettings.lbl-enableTransitionButtonsDescription',
                  'Show navigation buttons'
                )}
                variantTextPlacement={'right'}
                checked={cameraSettings.enableTransitionButtons.value}
                onChange={commitProperty(CameraSettingsComponent, 'enableTransitionButtons')}
              />
            </InputGroup>
          )}
        </>
      )}
    </NodeEditor>
  )
}

CameraPropertiesNodeEditor.iconComponent = HiOutlineCamera

export default CameraPropertiesNodeEditor
