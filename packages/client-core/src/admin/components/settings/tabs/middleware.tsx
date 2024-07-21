/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the LiDefault Valuecense.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

import { middlewareApiUrl, middlewareSettingPath } from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import React, { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import MiddlewareInput from './middleware-components/MiddlewareInput'
import MiddlewareSelect from './middleware-components/MiddlewareSelect'
import MiddlewareTextarea from './middleware-components/MiddlewareTextarea'
import MiddlewareToggle from './middleware-components/MiddlewareToggle'

import { assetPath } from '@etherealengine/common/src/schema.type.module'

const MiddlewareTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const patchMiddlewareSetting = useMutation(middlewareSettingPath).patch
  const middlewareTable = useFind(middlewareSettingPath).data
  const middlewareSetting = useFind(middlewareSettingPath).data.at(0)
  const middlewareApi = useFind(middlewareApiUrl).data.at(0)

  const id = middlewareSetting?.id
  const mS = middlewareTable
  let mtObj = {}
  const middlewareTemplate = middlewareSetting?.middlewareSettingTemp

  const middlewareUrlBase = middlewareApi?.middlewareUrl
  console.log('#### #### #### middlewareApi ####', middlewareApiUrl, '####', middlewareUrlBase)

  const [mwSettings, setMwSettings] = useState([])

  const scenes = useFind(assetPath, {
    query: {
      paginate: false
    }
  })

  useEffect(() => {
    if (mS !== undefined) {
      try {
        // #### Multi Project Array #### //
        mtObj = middlewareTable.reduce((acc, object) => {
          acc[object.middlewareProject] = JSON.parse(object.middlewareSettingMenu)
          return acc
        }, {})

        const data = scenes['data']

        middlewareTable.forEach((object) => {
          const projectName = object.middlewareProjectName
          let projectScenes = {}

          for (let item of data) {
            if (item.projectName === projectName) {
              let sceneName = item.assetURL
              let arr = sceneName.split('/')
              let key = arr[arr.length - 1].split('.')[0]
              projectScenes[key] = key
                .replace(/-/g, ' ')
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            }
          }
        })

        console.log('#### mtObj', JSON.stringify(mtObj, null, 2))

        setMwSettings(mtObj)
        // #### Multi Project Array #### //
      } catch (e) {
        console.error('#### Could not parse middlewareSettingMenu', e)
      }
    }
  }, [mS]) // useEffect will re-run whenever mS changes
  /////* Dynamic Menu - Experimental */////

  const components = {
    MiddlewareInput: MiddlewareInput,
    MiddlewareToggle: MiddlewareToggle,
    MiddlewareSelect: MiddlewareSelect,
    MiddlewareTextarea: MiddlewareTextarea
  }

  const mwHandleChange = (inputValue: string, project: string, category: string, inputLabel: string) => {
    setMwSettings((prevMwSettings) => {
      const newMwSettings = JSON.parse(JSON.stringify(prevMwSettings))

      // iterate over newMwSettings
      Object.entries(newMwSettings[project]).forEach(([key, value]) => {
        if (key === category) {
          // iterate over setting entries
          value.forEach((setting, idx) => {
            // checks if the component matches MiddlewareInput and the label matches inputLabel
            if (setting.component === 'MiddlewareInput' && setting.label === inputLabel) {
              // set the setting's value to the passed inputValue
              setting.value = inputValue
            }
          })
        }
      })

      return newMwSettings
    })
  }

  const mwHandleTextarea = (inputValue: string, project: string, category: string, label: string) => {
    console.log('#### #### mwHandleTextarea', project, category, label, '### e', inputValue, typeof inputValue)
    setMwSettings((prevMwSettings) => {
      const newMwSettings = JSON.parse(JSON.stringify(prevMwSettings))
      const testSettingKeys = Object.keys(newMwSettings)

      console.log('#### #### setMwSettings', testSettingKeys)
      console.log('#### #### category', newMwSettings[project][category])

      Object.entries(newMwSettings[project]).forEach(([key, value]) => {
        if (key === category) {
          console.log('#### #### entries', key)
          value.forEach((setting, idx) => {
            console.log(
              '#### #### #### forEach',
              setting.component,
              '===',
              'MiddlewareTextarea',
              '&&',
              setting.label,
              '===',
              label
            )
            if (setting.component === 'MiddlewareTextarea' && setting.label === label) {
              console.log('#### PASS #### mwHandleTextarea', setting.value, typeof setting.value)
              setting.value = inputValue
            } else {
              console.log('#### FAIL #### mwHandleTextarea')
            }
          })
        }
      })

      return newMwSettings
    })
  }

  const mwHandleToggle = (inputLabel: string, project: string, category: string) => {
    setMwSettings((prevMwSettings) => {
      const newMwSettings = JSON.parse(JSON.stringify(prevMwSettings))

      console.log('Project:', project)
      console.log('category', category)
      console.log('inputLabel', inputLabel)
      console.log('NewTestSettings:', newMwSettings)

      // Iterate over entries corresponding the project key
      Object.entries(newMwSettings[project]).forEach(([key, value]) => {
        // If the key matches the category, process the settings
        if (key === category) {
          // Iterate over each setting under the category
          value.forEach((setting, idx) => {
            // If the condition is satisfied, toggle the value
            if (setting.component === 'MiddlewareToggle' && setting.label === inputLabel) {
              setting.value = !setting.value // toggle the value
            }
          })
        }
      })

      return newMwSettings
    })
  }

  const mwHandleSelect = (inputValue: string, project: string, category: string, inputLabel: string) => {
    setMwSettings((prevMwSettings) => {
      const newMwSettings = JSON.parse(JSON.stringify(prevMwSettings))

      //Iterate over entries corresponding the project key
      Object.entries(newMwSettings[project]).forEach(([key, value]) => {
        // If the key matches the category, process the settings
        if (key === category) {
          // Iterate over each setting under the category
          value.forEach((setting, _) => {
            if (setting.component === 'MiddlewareSelect' && setting.label === inputLabel) {
              const filtered = setting.value.filter((item) => item !== inputValue)
              setting.value = [inputValue, ...filtered]
            }
          })
        }
      })

      return newMwSettings
    })
  }

  const actions = {
    mwHandleChange: mwHandleChange,
    mwHandleToggle: mwHandleToggle,
    mwHandleSelect: mwHandleSelect,
    mwHandleTextarea: mwHandleTextarea
  }

  /////* Dynamic Menu - Experimental */////

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // TODO need to refactor the way we hit update webhooks, there will be multiple
  async function updateMw(tenant: string): Promise<Response> {
    const apiUrl = `${middlewareUrlBase}/middleware/v1/update`
    console.log('#### #### Middleware update hook:', apiUrl)
    await delay(5000)
    const response = await fetch(apiUrl, {
      method: 'GET', // explicitly specify the method
      headers: {
        tenant: tenant,
        project: 'irpro-electronics-store'
      }
    })
    return response
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!id) return
    state.loading.set(true)

    const middlewareSettingsMenuJson = JSON.stringify(mwSettings)
    const middlewareSettingObj = mwSettings

    const projectNameArr = Object.keys(middlewareSettingObj)

    console.log('#### projectNameArr', projectNameArr)

    projectNameArr.forEach((projectName, index) => {
      console.log('#### projectNameArr', projectName, index, typeof middlewareTable[index])
      console.log('#### middlewareSettingObj', JSON.stringify(JSON.stringify(mwSettings[projectName]), null, 2))
      const middlewareRow = middlewareTable[index]
      console.log('#### forEach', middlewareRow.id, middlewareRow.middlewareProject)
      if (projectName === middlewareRow.middlewareProject) {
        console.log('#### if', projectName, '===', middlewareRow.middlewareProject, '# id', middlewareRow.id)
        patchMiddlewareSetting(middlewareRow.id, {
          middlewareSettingMenu: JSON.stringify(mwSettings[projectName])
        })
          .then(() => {
            state.set({ loading: false, errorMessage: '' })
          })
          .catch((e) => {
            state.set({ loading: false, errorMessage: e.message })
          })
      }
    })

    // Hit middleware setting-update webhook
    console.log('#### #### #### middlewareApi ####', middlewareApiUrl, '####', middlewareApi)
    const tenant = 'default' // TODO scope for MT
    updateMw(tenant).then((response) => {
      console.log('#### Middleware setting update:', response)
    })
  }

  const renderSettings = (settings, components, actions, project, category) => {
    console.log('#### renderSettings', project, category, settings, components)
    return settings.map((setting, idx) => {
      const Component = components[setting.component]
      const onAction = actions[setting.action]
      const compLabel = setting.label
      const handleAction = (e) => {
        onAction(e, project, category, compLabel)
      }
      return (
        <div>
          <Component key={idx} mwLabel={setting.label} mwDefaultValue={setting.value} mwOnAction={handleAction} />
        </div>
      )
    })
  }

  return (
    <Accordion
      title={t('admin:components.setting.middleware.header')}
      subtitle={t('admin:components.setting.middleware.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      {/* Dynamic Menu - Experimental */}
      {Object.entries(mwSettings).map(([projectName, categories]) => {
        return (
          <div className="mt-6 grid grid-cols-2 gap-4" key={projectName}>
            <h3 className="col-span-full mb-4">{projectName}</h3>
            {Object.entries(categories).map(([categoryName, settings]) => {
              const formattedCategoryName = categoryName.replace(/-/g, ' ').toUpperCase()
              return (
                <div key={categoryName}>
                  <h4>{formattedCategoryName}</h4>
                  {renderSettings(settings, components, actions, projectName, categoryName)}
                </div>
              )
            })}
          </div>
        )
      })}
      {/* Dynamic Menu - Experimental */}

      <div className="mt-6 grid grid-cols-8 gap-6">
        {/*<Button size="small" className="bg-theme-highlight text-primary col-span-1" onClick={handleCancel} fullWidth>*/}
        {/*  {t('admin:components.common.reset')}*/}
        {/*</Button>*/}
        <Button
          size="small"
          variant="primary"
          className="col-span-1"
          onClick={handleSubmit}
          startIcon={state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          fullWidth
        >
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default MiddlewareTab
