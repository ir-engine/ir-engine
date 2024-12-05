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

import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, helmVersionPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Select } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

const HelmTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const helmSettings = useFind(engineSettingPath, {
    query: {
      category: 'helm',
      paginate: false
    }
  })

  const helmMain = helmSettings.data.find((setting) => setting.key === EngineSettings.Helm.Builder)?.value
  const helmBuilder = helmSettings.data.find((setting) => setting.key == EngineSettings.Helm.Main)?.value

  const selectedMainVersion = useHookstate(helmMain)

  const helmMainVersions = useFind(helmVersionPath, {
    query: {
      action: 'main'
    }
  }).data
  const mainVersionMenu = helmMainVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const helmBuilderVersions = useFind(helmVersionPath, {
    query: {
      action: 'builder'
    }
  }).data
  const selectedBuilderVersion = useHookstate(helmBuilder)
  const builderVersionMenu = helmBuilderVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const helmMutation = useMutation(engineSettingPath)
  const handleSubmit = (event) => {
    event.preventDefault()

    if (!selectedMainVersion.value || !selectedBuilderVersion.value) return
    state.loading.set(true)

    const setting = {
      main: selectedMainVersion.value,
      builder: selectedBuilderVersion.value
    }

    const operation = Object.values(EngineSettings.Helm).map((key) => {
      const settingInDb = helmSettings.data.find((el) => el.key === key)
      if (!settingInDb) {
        return helmMutation.create({
          key,
          category: 'helm',
          value: setting[key],
          type: 'private'
        })
      }
      return helmMutation.patch(settingInDb.id, {
        key,
        category: 'helm',
        value: setting[key],
        type: 'private'
      })
    })

    Promise.all(operation)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    selectedMainVersion.set(helmMain)
    selectedBuilderVersion.set(helmBuilder)
  }

  useEffect(() => {
    if (helmSettings.status == 'success') {
      selectedMainVersion.set(helmMain)
      selectedBuilderVersion.set(helmBuilder)
    }
  }, [helmSettings.status])

  return (
    <Accordion
      title={t('admin:components.setting.helm.header')}
      subtitle={t('admin:components.setting.helm.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <Text component="p" className="mb-6 mt-2 dark:text-[#A3A3A3]">
        {t('admin:components.setting.helm.subtitle')}
      </Text>

      <div className="mb-6 grid w-full grid-cols-2 gap-2">
        <Select
          labelProps={{
            text: t('admin:components.setting.helm.main'),
            position: 'top'
          }}
          options={mainVersionMenu}
          onChange={(value) => {
            selectedMainVersion.set(value as string)
          }}
          value={selectedMainVersion.value || ''}
        />

        <Select
          labelProps={{
            text: t('admin:components.setting.helm.builder'),
            position: 'top'
          }}
          options={builderVersionMenu}
          onChange={(value) => {
            selectedBuilderVersion.set(value as string)
          }}
          value={selectedBuilderVersion.value || ''}
        />

        <div className="col-span-1 mt-6 grid grid-cols-4 gap-6">
          <Button size="small" className="text-primary col-span-1 bg-theme-highlight" onClick={handleCancel} fullWidth>
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
      </div>
    </Accordion>
  )
})

export default HelmTab
