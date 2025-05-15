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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  Entity,
  SystemDefinitions,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getOptionalComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import '@ir-engine/engine'
import '@ir-engine/engine/src/avatar/state/AvatarNetworkState'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { addError } from '@ir-engine/engine/src/scene/functions/ErrorFunctions'
import { startReactor } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import { NotificationService } from '../common/services/NotificationService'
import { LinkErrorSystem } from './LinkErrorSystem'

const system = SystemDefinitions.get(LinkErrorSystem)!

describe('LinkErrorSystem', () => {
  let linkEntity: Entity = UndefinedEntity

  beforeAll(() => {
    vi.mock('react-i18next', () => ({
      useTranslation: () => {
        return {
          t: (i18nKey) => i18nKey
        }
      }
    }))
  })

  beforeEach(() => {
    createEngine()
    linkEntity = createEntity()
    setComponent(linkEntity, LinkComponent)
  })

  afterEach(() => {
    removeEntity(linkEntity)
    return destroyEngine()
  })

  it('should display error notification and remove error component', async () => {
    const spy = vi.spyOn(NotificationService, 'dispatchNotify').mockImplementation(() => undefined)

    addError(linkEntity, LinkComponent, 'WINDOW_BLOCKED', 'Unable to open link in new tab.')
    const errorComponentBefore = getOptionalComponent(linkEntity, ErrorComponent)
    expect(errorComponentBefore).toBeDefined()
    expect(errorComponentBefore).toHaveProperty(LinkComponent.name)

    const root = startReactor(system.reactor!)
    await act(async () => render(null))
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(spy).toHaveBeenCalled()

    const errorComponentAfter = getOptionalComponent(linkEntity, ErrorComponent)
    expect(errorComponentAfter).toBeUndefined()
  })

  it('should not display error notification', async () => {
    const spy = vi.spyOn(NotificationService, 'dispatchNotify').mockImplementation(() => undefined)

    addError(linkEntity, LinkComponent, 'INVALID_URL', 'Please enter a valid URL.')
    const errorComponentBefore = getOptionalComponent(linkEntity, ErrorComponent)
    expect(errorComponentBefore).toBeDefined()
    expect(errorComponentBefore).toHaveProperty(LinkComponent.name)

    const root = startReactor(system.reactor!)
    await act(async () => render(null))
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(spy).not.toHaveBeenCalled()

    const errorComponentAfter = getOptionalComponent(linkEntity, ErrorComponent)
    expect(errorComponentAfter).toBeDefined()
  })
})
