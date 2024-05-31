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

import { middlewareSettingPath } from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import React, { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import MiddlewareInput from './middleware-components/MiddlewareInput'
import MiddlewareSelect from './middleware-components/MiddlewareSelect'
import MiddlewareTextarea from './middleware-components/MiddlewareTextarea'
import MiddlewareToggle from './middleware-components/MiddlewareToggle'

const MiddlewareTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const patchMiddlewareSetting = useMutation(middlewareSettingPath).patch
  const middlewareSetting = useFind(middlewareSettingPath).data.at(0)

  const id = middlewareSetting?.id
  const mS = middlewareSetting?.middlewareSettingMenu
  const c0 = useHookstate(middlewareSetting?.conf0)
  const c1 = useHookstate(middlewareSetting?.conf1)
  const c2 = useHookstate(middlewareSetting?.conf2)

  // Initialize testSettings state
  const [testSettings, setTestSettings] = useState({})

  console.log('### middleware mS:', mS)

  useEffect(() => {
    if (mS !== undefined) {
      console.log('### useEffect mS:', typeof mS, mS)
      try {
        // const mSJson = JSON.parse(Buffer.from(mS).toString('utf8'))
        const mSJson = JSON.parse(mS.toString('utf8'))
        console.log('#### mSJson', mSJson, typeof mSJson)
        setTestSettings(mSJson)
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

  const mwHandleChange = (inputValue: string, inputLabel: string) => {
    // console.log('#### #### mwHandleChange', inputValue, typeof(inputValue), inputLabel, typeof(inputLabel), inputValue, typeof(inputValue))

    // console.log(inputLabel, inputValue)

    setTestSettings((prevTestSettings) => {
      const newTestSettings = JSON.parse(JSON.stringify(prevTestSettings))

      Object.entries(newTestSettings).forEach(([key, value]) => {
        value.forEach((setting, idx) => {
          if (setting.component === 'MiddlewareInput' && setting.label === inputLabel) {
            // console.log('#### mwHandleChange', setting.value, typeof(setting.value))
            setting.value = inputValue
          }
        })
      })
      return newTestSettings
    })
    // console.log('## mwHandleChange', testSettings)
  }

  const mwHandleTextarea = (inputValue: string, inputLabel: string) => {
    // console.log('#### #### mwHandleTextarea', inputValue, typeof(inputValue), inputLabel, typeof(inputLabel))

    setTestSettings((prevTestSettings) => {
      const newTestSettings = JSON.parse(JSON.stringify(prevTestSettings))

      Object.entries(newTestSettings).forEach(([key, value]) => {
        value.forEach((setting, idx) => {
          if (setting.component === 'MiddlewareTextarea' && setting.label === inputLabel) {
            // console.log('#### mwHandleTextarea', setting.value, typeof(setting.value))
            setting.value = inputValue
          }
        })
      })

      return newTestSettings
    })
    // console.log('## mwHandleTextarea', testSettings)
  }

  const mwHandleToggle = (inputLabel: string) => {
    // console.log('#### #### mwHandleToggle', inputLabel, typeof(inputLabel))

    setTestSettings((prevTestSettings) => {
      const newTestSettings = JSON.parse(JSON.stringify(prevTestSettings))

      Object.entries(newTestSettings).forEach(([key, value]) => {
        value.forEach((setting, idx) => {
          if (setting.component === 'MiddlewareToggle' && setting.label === inputLabel) {
            // console.log('#### mwHandleToggle', !setting.value, typeof(setting.value))
            setting.value = !setting.value // toggle the value
          }
        })
      })
      return newTestSettings
    })
    // console.log('## mwHandleToggle', testSettings)
  }

  const mwHandleSelect = (inputValue: string, inputLabel: string) => {
    // console.log('#### #### mwHandleSelect', inputValue, typeof(inputValue), inputLabel, typeof(inputLabel))

    setTestSettings((prevTestSettings) => {
      const newTestSettings = JSON.parse(JSON.stringify(prevTestSettings))

      Object.values(newTestSettings).forEach((value) => {
        value.forEach((setting, _) => {
          if (setting.component === 'MiddlewareSelect' && setting.label === inputLabel) {
            // console.log('#### mwHandleSelect', setting.value, typeof(setting.value))
            // Filter out the selected value from the array
            const filtered = setting.value.filter((item) => item !== inputValue)
            // Put the selected value at the start of the array
            setting.value = [inputValue, ...filtered]
          }
        })
      })

      return newTestSettings
    })
    // console.log('## mwHandleSelect', testSettings)
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

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!id) return
    state.loading.set(true)

    const middlewareSettingsMenuJson = JSON.stringify(testSettings)

    patchMiddlewareSetting(id, {
      middlewareSettingMenu: middlewareSettingsMenuJson,
      conf0: c0.value,
      conf1: c1.value,
      conf2: c2.value
    })
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  // const handleCancel = () => {
  //   // TODO: middlewareSettingMenu state logic
  //   c0.set(middlewareSetting?.conf0)
  //   c1.set(middlewareSetting?.conf1)
  //   c2.set(middlewareSetting?.conf2)
  // }

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
      {Object.entries(testSettings).map(([key, value]) => {
        return (
          <div className="mt-6 grid grid-cols-2 gap-4" key={key}>
            <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
              {key}
            </Text>
            {value.map((setting, idx) => {
              const Component = components[setting.component]
              const onAction = actions[setting.action]
              return (
                <Component key={idx} mwLabel={setting.label} mwDefaultValue={setting.value} mwOnAction={onAction} />
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
