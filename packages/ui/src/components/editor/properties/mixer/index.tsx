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

import { EntityID, UUIDComponent } from '@ir-engine/ecs'
import { getAllComponents, Layers, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { MixableType, MixerComponent } from '@ir-engine/engine/src/scene/components/MixerComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdBlender } from 'react-icons/md'
import { Color, Quaternion, Vector2, Vector3, Vector4 } from 'three'
import Button from '../../../../primitives/tailwind/Button'
import { ColorInput } from '../../../../primitives/tailwind/Color'
import EulerInput from '../../input/Euler'
import InputGroup from '../../input/Group'
import NodeInput from '../../input/Node'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'
import Vector2Input from '../../input/Vector2'
import Vector3Input from '../../input/Vector3'
import Vector4Input from '../../input/Vector4'

const renderPropertyInput = (
  type: MixableType,
  currentValue: number[],
  updatePropertyValue: (newValue: any) => void
) => {
  switch (type) {
    case 'number':
      return (
        <NumericInput
          value={currentValue[0]}
          onChange={(value) => updatePropertyValue(value)}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
        />
      )

    case 'Vector2':
      return <Vector2Input value={new Vector2(...currentValue)} onChange={(value) => updatePropertyValue(value)} />

    case 'Vector3':
      return <Vector3Input value={new Vector3(...currentValue)} onChange={(value) => updatePropertyValue(value)} />

    case 'Vector4':
      return <Vector4Input value={new Vector4(...currentValue)} onChange={(value) => updatePropertyValue(value)} />

    case 'Quaternion':
      return (
        <EulerInput
          quaternion={new Quaternion(...currentValue)}
          onChange={(quat) => updatePropertyValue(quat)}
          unit="°"
        />
      )

    case 'Color':
      return <ColorInput value={new Color(...currentValue)} onChange={(color) => updatePropertyValue(color)} />
  }
}

export const MixerNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const mixerEntity = props.entity
  const mixerComponent = useComponent(mixerEntity, MixerComponent)

  // Local state for managing UI
  const newPropertyEntityID = useHookstate('' as EntityID)
  const newPropertyComponentJsonID = useHookstate('')
  const newPropertyName = useHookstate('')
  const selectedEntryCoord = useHookstate<number | null>(null)
  const newEntryCoord = useHookstate(0)

  // Helper function to add a new property
  const addProperty = () => {
    MixerComponent.addProperty(
      mixerEntity,
      newPropertyEntityID.value,
      newPropertyComponentJsonID.value,
      newPropertyName.value
    )
    newPropertyEntityID.set('' as EntityID)
    newPropertyComponentJsonID.set('')
    newPropertyName.set('')
  }

  // Helper function to remove a property
  const removeProperty = (index: number) => {
    MixerComponent.removePropertyAtIndex(mixerEntity, index)
  }

  // Helper function to add a new entry
  const addEntry = () => {
    const coord = newEntryCoord.value
    MixerComponent.appendEntry(mixerEntity, coord, MixerComponent.getDefaultEntry(mixerEntity))
    selectedEntryCoord.set(coord)
  }

  // Helper function to remove an entry
  const removeEntry = (coord: number) => {
    MixerComponent.deleteEntry(mixerEntity, coord)
    if (selectedEntryCoord.value === coord) {
      selectedEntryCoord.set(null)
    }
  }

  // Get current entries for display
  const entries = mixerComponent.entries.value as [number, Record<string, number[]>][]
  const sortedEntries = [...entries].sort((a, b) => a[0] - b[0])

  const newPropertyEntity = UUIDComponent.getEntityFromSameSourceByID(
    mixerEntity,
    newPropertyEntityID.value,
    Layers.Authoring
  )
  const componentOptions =
    newPropertyEntityID.value !== ''
      ? getAllComponents(newPropertyEntity)
          .filter((component) => component.jsonID)
          .map((component) => ({
            label: component.name,
            value: component.jsonID!
          }))
      : []

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.mixer.name', 'Mixer Component')}
      description={t(
        'editor:properties.mixer.description',
        'Interpolates between values of registered properties based on coordinate.'
      )}
      Icon={MixerNodeEditor.iconComponent}
    >
      {/* Current Coordinate */}
      <InputGroup name="Coordinate" label={t('editor:properties.mixer.coordinate', 'Current Coordinate')}>
        <NumericInput
          value={mixerComponent.coord.value}
          onChange={updateProperty(MixerComponent, 'coord')}
          onRelease={commitProperty(MixerComponent, 'coord')}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
        />
      </InputGroup>

      {/* Properties Section */}
      <InputGroup name="Properties" label={t('editor:properties.mixer.properties', 'Tracked Properties')}>
        <div className="space-y-2">
          {/* Add new property */}
          <div className="flex gap-2">
            <NodeInput
              value={newPropertyEntityID.value}
              onRelease={(value) => newPropertyEntityID.set(value)}
              placeholder={t('editor:properties.mixer.propertyUUIDPlaceholder', 'Target Entity')}
            />
            <SelectInput
              value={newPropertyComponentJsonID.value}
              onChange={(value) => newPropertyComponentJsonID.set(value as string)}
              options={componentOptions}
              // placeholder={t('editor:properties.mixer.propertyComponentPlaceholder', 'Component...')}
            />
            <StringInput
              value={newPropertyName.value}
              onChange={(value) => newPropertyName.set(value)}
              placeholder={t('editor:properties.mixer.propertyNamePlaceholder', 'Property...')}
            />
            <Button
              onClick={addProperty}
              disabled={
                newPropertyEntityID.value === '' ||
                !newPropertyComponentJsonID.value.trim() ||
                !newPropertyName.value.trim()
              }
            >
              {t('editor:properties.mixer.addProperty', 'Add')}
            </Button>
          </div>

          {/* Property list */}
          {mixerComponent.properties.value.length > 0 && (
            <div className="space-y-1">
              {mixerComponent.properties.value.map((property, index) => (
                <div key={index} className="flex w-full items-center gap-2">
                  {property.address}
                  <Button onClick={() => removeProperty(index)} variant="secondary">
                    {t('editor:properties.mixer.remove', 'Remove')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </InputGroup>

      {/* Entries Section */}
      <InputGroup name="Entries" label={t('editor:properties.mixer.entries', 'Keyframe Entries')}>
        <div className="space-y-2">
          {/* Add new entry */}
          <div className="flex gap-2">
            <NumericInput
              value={newEntryCoord.value}
              onChange={(value) => newEntryCoord.set(value)}
              placeholder={t('editor:properties.mixer.entryCoordPlaceholder', 'Coordinate')}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
            />
            <Button onClick={addEntry}>{t('editor:properties.mixer.addEntry', 'Add Entry')}</Button>
          </div>

          {/* Entry list */}
          {sortedEntries.length > 0 && (
            <div className="space-y-1">
              {sortedEntries.map(([coord, entry]) => (
                <div
                  key={coord}
                  className={`flex cursor-pointer items-center gap-2 rounded border p-2 transition-colors ${
                    selectedEntryCoord.value === coord
                      ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => selectedEntryCoord.set(coord)}
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {t('editor:properties.mixer.entryCoord', 'Coordinate')}: {coord}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Object.keys(entry).length} {t('editor:properties.mixer.properties', 'properties')}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEntry(coord)
                    }}
                    variant="secondary"
                  >
                    {t('editor:properties.mixer.remove', 'Remove')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </InputGroup>

      {/* Entry Details */}
      {selectedEntryCoord.value !== null && (
        <InputGroup
          name="EntryDetails"
          label={t('editor:properties.mixer.entryDetails', 'Entry Details for Coordinate {{coord}}', {
            coord: selectedEntryCoord.value
          })}
        >
          <div className="space-y-2">
            {/* Property Value Inputs */}
            {mixerComponent.properties.value.map((property) => {
              const propertyAddress = property.address
              const currentEntry = MixerComponent.getEntry(mixerEntity, selectedEntryCoord.value!)!
              const currentValue = currentEntry[propertyAddress]!

              const setter = MixerComponent.propertySetter(
                mixerEntity,
                property.entityID,
                property.componentID,
                property.propertyPath
              )!

              // Helper function to update property value in entry
              const updatePropertyValue = (newValue: any) => {
                const entryUpdate = setter(newValue)
                const existingEntry = MixerComponent.getEntry(mixerEntity, selectedEntryCoord.value!) || {}
                MixerComponent.setEntry(mixerEntity, selectedEntryCoord.value!, {
                  ...existingEntry,
                  ...entryUpdate
                })
              }

              return (
                <InputGroup key={propertyAddress} name={propertyAddress} label={`/${propertyAddress}`}>
                  {renderPropertyInput(property.type, currentValue, updatePropertyValue)}
                </InputGroup>
              )
            })}

            {mixerComponent.properties.length === 0 && (
              <div className="text-sm text-gray-500">
                {t(
                  'editor:properties.mixer.noProperties',
                  'No properties tracked. Add properties above to edit their values.'
                )}
              </div>
            )}
          </div>
        </InputGroup>
      )}
    </NodeEditor>
  )
}

MixerNodeEditor.iconComponent = MdBlender

export default MixerNodeEditor
