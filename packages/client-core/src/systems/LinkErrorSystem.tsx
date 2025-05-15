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

import { defineSystem, useComponent, useEntityContext } from '@ir-engine/ecs'
import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { removeError } from '@ir-engine/engine/src/scene/functions/ErrorFunctions'
import { TransformDirtyUpdateSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../common/services/NotificationService'

const LINK_ERROR_TYPE = 'WINDOW_BLOCKED'

const LinkErrorReactor = () => {
  const entity = useEntityContext()
  const errorComponent = useComponent(entity, ErrorComponent)
  const { t } = useTranslation()

  useEffect(() => {
    const linkErrors = errorComponent?.[LinkComponent.name].value
    if (linkErrors?.[LINK_ERROR_TYPE]) {
      NotificationService.dispatchNotify(t('user:common.windowBlocked'), { variant: 'error' })
      removeError(entity, LinkComponent, LINK_ERROR_TYPE)
    }
  }, [errorComponent?.value])

  return null
}

export const LinkErrorSystem = defineSystem({
  uuid: 'ee.client.LinkErrorSystem',
  insert: { before: TransformDirtyUpdateSystem },
  reactor: () => <QueryReactor Components={[ErrorComponent, LinkComponent]} ChildEntityReactor={LinkErrorReactor} />
})
