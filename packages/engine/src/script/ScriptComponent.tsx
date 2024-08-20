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
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const ScriptComponent = defineComponent({
  name: 'ScriptComponent',
  jsonID: 'EE_script',

  onInit: (entity) => {
    return {
      script: '',
      uuid: '',
      src: '', // default path is in the scripts directory
      async: false,
      run: false,
      disabled: false
    }
  },

  toJSON: (entity, component) => {
    return {
      src: cleanStorageProviderURLs(component.src.get({ noproxy: true })),
      async: component.async.value,
      script: '',
      run: false,
      disabled: component.disabled.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.disabled === 'boolean') component.disabled.set(json.disabled)
    if (typeof json.run === 'boolean') component.run.set(json.run)
    if (typeof json.async === 'boolean') component.async.set(json.async)
    if (typeof json.src === 'string') component.src.set(json.src)
    if (typeof json.script === 'string') component.script.set(json.script)
  },

  // we make reactor for each component handle the engine
  reactor: () => {
    const entity = useEntityContext()
    const scriptComponent = useComponent(entity, ScriptComponent)

    const fetchCode = async () => {
      const response = await fetch(scriptComponent.src.value)
      const text = await response.text()
      return text
    }

    useEffect(() => {
      if (!scriptComponent.src.value) return
      fetchCode().then(scriptComponent.script.set)
    }, [scriptComponent.src])

    useEffect(() => {
      if (scriptComponent.disabled.value) return

      const script: HTMLScriptElement | null = document.querySelector(`script[id="${scriptComponent.uuid.value}"]`)
      if (!script) return

      script.src = scriptComponent.src.value
    }, [scriptComponent.src])

    useEffect(() => {
      if (scriptComponent.disabled.value) return
      const script: HTMLScriptElement | null = document.querySelector(`script[id="${scriptComponent.uuid.value}"]`)
      if (!script) return
      script.async = scriptComponent.async.value
    }, [scriptComponent.async])

    useEffect(() => {
      if (scriptComponent.disabled.value) return
      let script: HTMLScriptElement | null = document.querySelector(`script[id="${scriptComponent.uuid.value}"]`)
      if (!script) {
        script = document.createElement('script')
        script.id = uuidv4()
        scriptComponent.uuid.set(script.id)
      }
      if (!scriptComponent.run.value) return
      script.src = scriptComponent.src.value
      script.async = scriptComponent.async.value
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }, [scriptComponent.run])
  }
})
