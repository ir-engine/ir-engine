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
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import React, { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import MiddlewareInput from './middleware-components/MiddlewareInput'
import MiddlewareSelect from './middleware-components/MiddlewareSelect'
import MiddlewareTextarea from './middleware-components/MiddlewareTextarea'
import MiddlewareToggle from './middleware-components/MiddlewareToggle'

console.log('#### middleware')

const MiddlewareTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const patchMiddlewareSetting = useMutation(middlewareSettingPath).patch
  const middlewareSetting = useFind(middlewareSettingPath).data.at(0)
  // console.log('middlewareSetting', middlewareSetting, middlewareSetting?.middlewareSettingMenu)

  const id = middlewareSetting?.id
  const mS = middlewareSetting?.middlewareSettingMenu
  const c0 = useHookstate(middlewareSetting?.conf0)
  const c1 = useHookstate(middlewareSetting?.conf1)
  const c2 = useHookstate(middlewareSetting?.conf2)
  // const mS = useHookstate(middlewareSetting?.middlewareSettingMenu)

  // console.log(id, mS, c0.value, c1.value, c2.value)
  console.log('#### mS', mS)

  let mSJson
  // if (middlewareSetting?.middlewareSettingMenu) {
  //   try {
  //     mSJson = JSON.parse(middlewareSetting?.middlewareSettingMenu);
  //   } catch (e) {
  //     console.error('Could not parse middlewareSettingMenu', e);
  //   }
  // }
  if (mS) {
    try {
      mSJson = JSON.parse(mS)
    } catch (e) {
      console.error('#### Could not parse middlewareSettingMenu', e)
    }
  }
  const mSmenu = useHookstate(mSJson)

  console.log('#### mSmenu', mSmenu.value)

  /* Dynamic Menu - Experimental */
  // const [testSettings, setTestSettings] = useState(JSON.parse())
  const [testSettings, setTestSettings] = useState([
    {
      Dynamic0: [
        {
          component: 'MiddlewareToggle',
          label: 'Dyn Toggle 0',
          value: true,
          action: 'mwHandleToggle'
        },
        {
          component: 'MiddlewareSelect',
          label: 'Dyn Select 0',
          value: ['opt0', 'opt1', 'opt2'],
          action: 'mwHandleSelect'
        },
        {
          component: 'MiddlewareTextarea',
          label: 'Textarea Label 0',
          value: 'Default Value',
          action: 'mwHandleTextarea'
        },
        {
          component: 'MiddlewareInput',
          label: 'Dyn Label 0',
          value: 'Default Value',
          action: 'mwHandleChange'
        },
        {
          component: 'MiddlewareInput',
          label: 'Dyn Label 1',
          value: 'Default Value',
          action: 'mwHandleChange'
        }
      ],
      Dynamic1: [
        {
          component: 'MiddlewareInput',
          label: 'Dyn Label 2',
          value: 'Default Value',
          action: 'mwHandleChange'
        },
        {
          component: 'MiddlewareInput',
          label: 'Dyn Label 3',
          value: 'Default Value',
          action: 'mwHandleChange'
        }
      ]
    }
  ])

  const components = {
    MiddlewareInput: MiddlewareInput,
    MiddlewareToggle: MiddlewareToggle,
    MiddlewareSelect: MiddlewareSelect,
    MiddlewareTextarea: MiddlewareTextarea
  }

  const mwHandleChange = (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = inputEvent.target.value
    const inputLabel = inputEvent.target.labels?.[0]?.innerText || ''

    console.log(inputLabel, inputValue)

    setTestSettings((prevTestSettings) => {
      const newTestSettings = JSON.parse(JSON.stringify(prevTestSettings))

      newTestSettings.forEach((dynamicObject, index) => {
        Object.entries(dynamicObject).forEach(([key, value]) => {
          value.forEach((setting, idx) => {
            if (setting.component === 'MiddlewareInput' && setting.label === inputLabel) {
              setting.value = inputValue
            }
          })
        })
      })

      return newTestSettings
    })
  }

  const mwHandleTextarea = (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = inputEvent.target.value
    console.log(inputValue)
  }

  const mwHandleToggle = (inputLabel: string) => {
    console.log(inputLabel)

    setTestSettings((prevTestSettings) => {
      // Shallow copy
      const newTestSettings = JSON.parse(JSON.stringify(prevTestSettings))

      newTestSettings.forEach((dynamicObject, index) => {
        Object.entries(dynamicObject).forEach(([key, value]) => {
          value.forEach((setting, idx) => {
            if (setting.component === 'MiddlewareToggle' && setting.label === inputLabel) {
              setting.value = !setting.value // toggle the value
            }
          })
        })
      })

      return newTestSettings
    })
  }

  const mwHandleSelect = (value: string, label: string) => {
    console.log(value, label)
  }

  const actions = {
    mwHandleChange: mwHandleChange,
    mwHandleToggle: mwHandleToggle,
    mwHandleSelect: mwHandleSelect,
    mwHandleTextarea: mwHandleTextarea
  }

  ///////

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('#### M handleSubmit')
    if (!id) return
    state.loading.set(true)
    patchMiddlewareSetting(id, {
      // middlewareSettingMenu: JSON.stringify(testSettings.value),
      conf0: c0.value,
      conf1: c1.value,
      conf2: c2.value
    })
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMesSavesage: e.message })
      })
    console.log('#### DONE', testSettings.value)
  }

  const handleCancel = () => {
    // setTestSettings(JSON.parse(middlewareSetting?.middlewareSettingMenu))
    c0.set(middlewareSetting?.conf0)
    c1.set(middlewareSetting?.conf1)
    c2.set(middlewareSetting?.conf2)
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
      {testSettings.map((dynamicObject, index) => {
        return Object.entries(dynamicObject).map(([key, value]) => {
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
        })
      })}
      {/* Dynamic Menu - Experimental */}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
          {t('admin:components.setting.middleware.main')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.middleware.main')}
          defaultValue={middlewareSetting?.conf0 || ''}
          type="text"
          onChange={(e) => c0.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.middleware.sub0')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.middleware.sub0opt0')}
          // value={conf1.value || ''}
          defaultValue={middlewareSetting?.conf1 || ''}
          onChange={(e) => c1.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.middleware.sub1')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.middleware.sub1opt0')}
          // value={conf2.value || ''}
          defaultValue={middlewareSetting?.conf2 || ''}
          onChange={(e) => c2.set(e.target.value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-8 gap-6">
        <Button size="small" className="bg-theme-highlight text-primary col-span-1" onClick={handleCancel} fullWidth>
          {t('admin:components.common.reset')}
        </Button>
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
