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

import Toggle from '@etherealengine/ui/src/primitives/tailwind/Toggle'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { FeatureFlagSettingType, featureFlagSettingPath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import { useHookstate } from '@hookstate/core'

const defaultProps = ['id', 'flagName', 'flagValue', 'createdAt', 'updatedAt']

const FeaturesTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const displayedFeatures = useHookstate<FeatureFlagSettingType[]>([])

  const featureFlagSettings = useFind(featureFlagSettingPath)

  // useEffect(() => {
  //   const defaultTypes = [
  //     'ir.client.menu.social',
  //     'ir.client.menu.emote',
  //     'ir.client.menu.avaturn',
  //     'ir.client.menu.readyPlayerMe'
  //   ]
  //
  //   if (featureFlagSettings.status === 'success') {
  //     const missingTypes = defaultTypes.filter(
  //       (type) =>
  //         !featureFlagSettings.data.find(
  //           (flag) => flag.flagName === type && !Object.keys(flag).filter((key) => !defaultProps.includes(key))
  //         )
  //     )
  //
  //     const updatedFeatures: FeatureFlagSettingType[] = [
  //       ...missingTypes.map((type) => ({
  //         flagName: type as FeatureFlag,
  //         flagValue: true,
  //         id: '',
  //         createdAt: '',
  //         updatedAt: ''
  //       })),
  //       ...featureFlagSettings.data
  //     ]
  //     displayedFeatures.set(updatedFeatures)
  //   }
  // }, [featureFlagSettings.data])

  return (
    <Accordion
      title={t('admin:components.setting.features.header')}
      subtitle={t('admin:components.setting.features.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-1 gap-6">
        {displayedFeatures.value.map((feature) => (
          <FeatureItem key={feature.id} feature={feature} />
        ))}
      </div>
    </Accordion>
  )
})

const FeatureItem = ({ feature }: { feature: FeatureFlagSettingType }) => {
  const additionalProps = Object.keys(feature).filter((key) => !defaultProps.includes(key))

  return (
    <div key={feature.id} className="flex items-center">
      <Toggle
        containerClassName="justify-start"
        label={feature.flagName}
        value={feature.flagValue}
        disabled
        onChange={(value) => {}}
      />
      {additionalProps.map((key) => (
        <div key={key} className="ml-6 text-sm text-gray-500">
          {key}: {feature[key]}
        </div>
      ))}
    </div>
  )
}

export default FeaturesTab
