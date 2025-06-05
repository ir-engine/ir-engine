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

import { calculateAndApplyYOffset } from '@ir-engine/common/src/utils/offsets'
import { Entity, EntityUUID, PresentationSystemGroup, UUIDComponent, useExecute } from '@ir-engine/ecs'
import {
  Component,
  ComponentJSONIDMap,
  Layers,
  getAllComponents,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ComponentEditorsState } from '@ir-engine/editor/src/services/ComponentEditors'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { ErrorBoundary, NO_PROXY, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Button } from '@ir-engine/ui'
import TransformPropertyGroup from '@ir-engine/ui/src/components/editor/properties/transform'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import { PlusCircleSm } from '@ir-engine/ui/src/icons'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getComponent } from '../../../../ecs/src/ComponentFunctions'
import { IconComponent } from '../../components/panels/IconComponent'
import ElementList from './elementlist'
import MaterialEditor from './materialeditor'

const EntityComponentEditor = ({
  entity,
  component,
  multiEdit
}: {
  entity: Entity
  component: Component
  multiEdit: boolean
}) => {
  const componentMounted = useHasComponent(entity, component)
  const Editor = getState(ComponentEditorsState)[component.name]!
  if (!componentMounted) return null
  // nodeEntity is used as key here to signal to React when the entity has changed,
  // and to prevent state from being recycled between editor instances, which
  // can cause hookstate to throw errors.
  return <Editor key={`${entity}-${Editor.name}`} multiEdit={multiEdit} entity={entity} component={component} />
}

const EntityEditor = ({ entityUUID, multiEdit }: { entityUUID: EntityUUID; multiEdit: boolean }) => {
  const { t } = useTranslation()

  const entity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
  const componentEditors = useHookstate(getMutableState(ComponentEditorsState)).get(NO_PROXY)
  const components = useHookstate([] as string[])

  useExecute(
    () => {
      const entityComponents = getAllComponents(entity)
        .filter(
          (component) =>
            component.name &&
            componentEditors[component.name] &&
            component.name !== TransformComponent.name &&
            component.jsonID !== undefined
        )
        .map((component) => component.jsonID!)
      if (JSON.stringify(entityComponents) !== JSON.stringify(components.get(NO_PROXY))) {
        components.set(entityComponents)
      }
    },
    { after: PresentationSystemGroup }
  )

  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      calculateAndApplyYOffset(popupRef.current)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const [isAddComponentMenuOpen, setIsAddComponentMenuOpen] = useState(false)

  const hasTransform = useHasComponent(entity, TransformComponent)
  const hasMaterial = useHasComponent(entity, MaterialStateComponent)
  const hasName = useHasComponent(entity, NameComponent)

  if (!entity) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full justify-between gap-2 bg-surface-3 p-2 px-3" id="add-component-popover">
        {hasName && (
          <div className="flex h-full w-1/2 flex-row items-center text-sm text-text-secondary group-hover/component-dropdown:text-text-primary group-focus/component-dropdown:text-text-primary">
            <IconComponent entity={entity} />
            <span className="ml-1 truncate leading-6 ">{getComponent(entity, NameComponent)}</span>
          </div>
        )}

        <Popup
          keepInside
          position={'left center'}
          open={isAddComponentMenuOpen}
          onClose={() => setIsAddComponentMenuOpen(false)}
          trigger={
            <Button variant="tertiary" size="sm" onClick={() => setIsAddComponentMenuOpen(true)}>
              <PlusCircleSm />
              {t('editor:properties.lbl-addComponent')}
            </Button>
          }
          onOpen={() => calculateAndApplyYOffset(popupRef.current)}
        >
          <div ref={popupRef} className="h-[600px] w-96 overflow-y-auto">
            <ElementList type="components" onSelect={() => setIsAddComponentMenuOpen(false)} />
          </div>
        </Popup>
      </div>
      <div className="overflow-y-auto">
        {hasTransform && (
          <ErrorBoundary fallback={<div>Error occured displaying transform properties</div>}>
            <Suspense>
              <TransformPropertyGroup entity={entity} />
            </Suspense>
          </ErrorBoundary>
        )}
        {hasMaterial && (
          <ErrorBoundary fallback={<div>Error occured displaying material properties</div>}>
            <Suspense>
              <MaterialEditor entity={entity} />
            </Suspense>
          </ErrorBoundary>
        )}
        {components.get(NO_PROXY).map((c) => {
          const component = ComponentJSONIDMap.get(c)
          return component ? (
            <ErrorBoundary
              key={`${entityUUID + entity}-${component.name}`}
              fallback={<div>Error occured displaying properties for {component.name}</div>}
            >
              <Suspense>
                <EntityComponentEditor multiEdit={multiEdit} entity={entity} component={component as Component} />
              </Suspense>
            </ErrorBoundary>
          ) : null
        })}
      </div>
    </div>
  )
}

const PropertiesEditor = () => {
  const { t } = useTranslation()
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities).value
  const multiEdit = selectedEntities.length > 1
  const uuid = selectedEntities[selectedEntities.length - 1]

  return (
    <div className="flex h-full flex-col gap-0.5 overflow-y-auto bg-surface-1">
      {uuid ? (
        <ErrorBoundary key={uuid} fallback={<div>Error occured displaying entity properties</div>}>
          <Suspense>
            <EntityEditor entityUUID={uuid} multiEdit={multiEdit} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <div className="flex h-full items-center justify-center text-text-secondary">
          {t('editor:properties.noNodeSelected')}
        </div>
      )}
    </div>
  )
}

export default PropertiesEditor
