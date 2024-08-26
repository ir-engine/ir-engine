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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { cleanStorageProviderURLs } from '@ir-engine/common/src/utils/parseSceneJSON'
import { defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { useEffect } from 'react'
import { addError, clearErrors, removeError } from '../scene/functions/ErrorFunctions'

export function validateScriptUrl(entity, url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      addError(entity, ScriptComponent, 'INVALID_URL_SCHEME', 'Invalid URL scheme')
      return false
    }
    if (!url.endsWith('.js')) {
      // replace with itemTypes later
      addError(entity, ScriptComponent, 'INVALID_SCRIPT_TYPE', 'URL does not point to a JavaScript file')
      return false
    }
    return true
  } catch (e) {
    addError(entity, ScriptComponent, 'INVALID_URL_FORMAT', 'Invalid URL format')
    return false
  }
}

export const ScriptComponent = defineComponent({
  name: 'ScriptComponent',
  jsonID: 'EE_script',

  onInit: (entity) => {
    return {
      src: '' // default path is in the scripts directory
    }
  },

  toJSON: (entity, component) => {
    return {
      src: cleanStorageProviderURLs(JSON.parse(JSON.stringify(component.src.get({ noproxy: true }))))
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.src === 'string') component.src.set(json.src)
  },

  // we make reactor for each component handle the engine
  reactor: () => {
    const entity = useEntityContext()
    const scriptComponent = useComponent(entity, ScriptComponent)

    useEffect(() => {
      if (getState(EngineState).isEditing) return
      const script = document.createElement('script')
      if (!scriptComponent.src.value) return // return for empty src
      if (!validateScriptUrl(entity, scriptComponent.src.value)) return // validation step
      clearErrors(entity, ScriptComponent)
      script.src = scriptComponent.src.value

      script.onerror = () => {
        addError(entity, ScriptComponent, 'MISSING_FILE', 'Failed to load the script!')
      }

      script.onload = () => {
        removeError(entity, ScriptComponent, 'MISSING_FILE')
      }

      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }, [scriptComponent.src])
  },
  errors: ['MISSING_FILE', 'INVALID_URL_SCHEME', 'INVALID_SCRIPT_TYPE', 'INVALID_URL_FORMAT']
})
