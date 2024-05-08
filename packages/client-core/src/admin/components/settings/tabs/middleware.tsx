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
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

import { NO_PROXY, getMutableState, none, useHookstate } from '@etherealengine/hyperflux'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import Toggle from '@etherealengine/ui/src/primitives/tailwind/Toggle'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'
import { AuthState } from '../../../../user/services/AuthService'
import {
  AdminMiddlewareSettingsState,
  MiddlewareSettingService
} from '../../../services/Setting/MiddlewareSettingService'

const MiddlewareTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })
  const user = useHookstate(getMutableState(AuthState).user)

  const middlewareSettingState = useHookstate(getMutableState(AdminMiddlewareSettingsState))
  const [middlewareSetting] = middlewareSettingState?.middleware?.get({ noproxy: true }) || []
  const id = middlewareSetting?.id

  const settings = useHookstate(middlewareSetting)

  useEffect(() => {
    if (user?.id?.value != null && middlewareSettingState?.updateNeeded?.value === true) {
      MiddlewareSettingService.fetchMiddlewareSettings()
    }
  }, [user?.id?.value, middlewareSettingState?.updateNeeded?.value])

  useEffect(() => {
    if (middlewareSetting) {
      settings.merge({
        logo: middlewareSetting?.logo,
        title: middlewareSetting?.title,
        shortTitle: middlewareSetting?.shortTitle,
        startPath: middlewareSetting?.startPath || '/',
        appTitle: middlewareSetting?.appTitle,
        appSubtitle: middlewareSetting?.appSubtitle,
        appDescription: middlewareSetting?.appDescription,
        appBackground: middlewareSetting?.appBackground,
        appSocialLinks: JSON.parse(JSON.stringify(middlewareSetting?.appSocialLinks)) || [],
        appleTouchIcon: middlewareSetting?.appleTouchIcon,
        icon192px: middlewareSetting?.icon192px,
        icon512px: middlewareSetting?.icon512px,
        webmanifestLink: middlewareSetting?.webmanifestLink,
        swScriptLink: middlewareSetting?.swScriptLink,
        favicon16px: middlewareSetting?.favicon16px,
        favicon32px: middlewareSetting?.favicon32px,
        siteDescription: middlewareSetting?.siteDescription,
        key8thWall: middlewareSetting?.key8thWall,
        homepageLinkButtonEnabled: middlewareSetting?.homepageLinkButtonEnabled,
        homepageLinkButtonRedirect: middlewareSetting?.homepageLinkButtonRedirect,
        homepageLinkButtonText: middlewareSetting?.homepageLinkButtonText
      })
    }
  }, [middlewareSettingState?.updateNeeded?.value])

  const codecMenu = [
    {
      value: 'VP9',
      label: 'VP9'
    },
    {
      value: 'VP8',
      label: 'VP8'
    },
    {
      value: 'h264',
      label: 'h264'
    }
  ]

  const videoMaxResolutionMenu = [
    {
      value: 'fhd',
      label: t('admin:components.setting.videoFHD')
    },
    {
      value: 'hd',
      label: t('admin:components.setting.videoHD')
    },
    {
      value: 'fwvga',
      label: t('admin:components.setting.videoFWVGA')
    },
    {
      value: 'nhd',
      label: t('admin:components.setting.videoNHD')
    }
  ]

  const handleSubmit = (event) => {
    state.loading.set(true)
    event.preventDefault()
    console.log(settings.get(NO_PROXY))
    settings.merge({
      createdAt: none,
      updatedAt: none
    })
    MiddlewareSettingService.patchMiddlewareSetting(settings.get(NO_PROXY), id)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    settings.set(middlewareSetting)
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
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
          {t('admin:components.setting.middleware.main')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appTitle')}
          value={settings.appTitle.value || ''}
          onChange={(e) => settings.appTitle.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.title')}
          value={settings.title.value || ''}
          onChange={(e) => settings.title.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appSubtitle')}
          value={settings.appSubtitle.value || ''}
          onChange={(e) => settings.appSubtitle.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.shortTitle')}
          value={settings.shortTitle.value || ''}
          onChange={(e) => settings.shortTitle.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appDescription')}
          value={settings.appDescription.value || ''}
          onChange={(e) => settings.appDescription.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.startPath')}
          value={settings.startPath.value || '/'}
          onChange={(e) => settings.startPath.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appBackground')}
          value={settings.appBackground.value || ''}
          onChange={(e) => settings.appBackground.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.description')}
          value={settings.siteDescription.value || ''}
          onChange={(e) => settings.siteDescription.set(e.target.value)}
        />

        <Toggle
          containerClassName="justify-start col-span-full"
          label={t('admin:components.setting.homepageLinkButtonEnabled')}
          value={settings.homepageLinkButtonEnabled.value}
          onChange={(value) => settings.homepageLinkButtonEnabled.set(value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.middleware.logo')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.logo')}
          value={settings.logo.value || ''}
          onChange={(e) => settings.logo.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appleTouchIcon')}
          value={settings.appleTouchIcon.value || ''}
          onChange={(e) => settings.appleTouchIcon.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.favIcon16px')}
          value={settings.favicon16px.value || ''}
          onChange={(e) => settings.favicon16px.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.favIcon32px')}
          value={settings.favicon32px.value || ''}
          onChange={(e) => settings.favicon32px.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.icon192px')}
          value={settings.icon192px.value || ''}
          onChange={(e) => settings.icon192px.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.icon512px')}
          value={settings.icon512px.value || ''}
          onChange={(e) => settings.icon512px.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.middleware.other')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.webmanifestLink')}
          value={settings.webmanifestLink.value || ''}
          onChange={(e) => settings.webmanifestLink.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.swScriptLink')}
          value={settings.swScriptLink.value || ''}
          onChange={(e) => settings.swScriptLink.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.url')}
          value={middlewareSetting?.url || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.releaseName')}
          value={middlewareSetting?.releaseName || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.key8thWall')}
          value={settings.key8thWall.value || ''}
          onChange={(e) => settings.key8thWall.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.middleware.media')}
        </Text>
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
