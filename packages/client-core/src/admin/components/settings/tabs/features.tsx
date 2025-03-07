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

import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall, HiUser } from 'react-icons/hi2'

import { useHookstate } from '@hookstate/core'
import { useFind, useMutation } from '@ir-engine/common'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { FeatureFlagSettingType, featureFlagSettingPath } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { getAllStringValueNodes } from '@ir-engine/common/src/utils/getAllStringValueNodes'
import { Tooltip } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'

const defaultProps = ['id', 'flagName', 'flagValue', 'userId', 'createdAt', 'updatedAt']

const FeaturesTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const displayedFeatures = useHookstate<FeatureFlagSettingType[]>([])

  const featureFlagSettings = useFind(featureFlagSettingPath, { query: { paginate: false } })

  useEffect(() => {
    if (featureFlagSettings.status === 'success') {
      const defaultTypes = getAllStringValueNodes(FeatureFlags)
      const missingTypes = defaultTypes.filter(
        (type) =>
          !featureFlagSettings.data.find(
            (flag) =>
              flag.flagName === type &&
              !Object.keys(flag)
                .filter((key) => !defaultProps.includes(key))
                .some((item) => !item)
          )
      )

      const updatedFeatures: FeatureFlagSettingType[] = [
        ...missingTypes.map((type) => ({
          flagName: type,
          flagValue: true,
          id: '',
          createdAt: '',
          updatedAt: ''
        })),
        ...featureFlagSettings.data
      ]
      displayedFeatures.set(updatedFeatures)
    }
  }, [featureFlagSettings.data])

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
        {displayedFeatures.value
          .toSorted()
          .sort((a, b) => a.flagName.localeCompare(b.flagName))
          .map((feature) => (
            <FeatureItem key={feature.flagName} feature={feature} />
          ))}
      </div>
    </Accordion>
  )
})

const FeatureItem = ({ feature }: { feature: FeatureFlagSettingType }) => {
  const { t } = useTranslation()

  const featureFlagSettingMutation = useMutation(featureFlagSettingPath)
  const additionalProps = Object.keys(feature).filter((key) => !defaultProps.includes(key))

  const createOrUpdateFeatureFlag = async (feature: FeatureFlagSettingType, enabled: boolean) => {
    if (feature.id) {
      await featureFlagSettingMutation.patch(feature.id, { flagValue: enabled })
    } else {
      await featureFlagSettingMutation.create({
        flagName: feature.flagName,
        flagValue: enabled
      })
    }
  }

  return (
    <div key={feature.id} className="flex items-center">
      <Toggle
        containerClassName="justify-start"
        label={feature.flagName}
        value={feature.flagValue}
        onChange={(value) => createOrUpdateFeatureFlag(feature, value)}
      />
      {feature.userId && (
        <Tooltip
          content={t('admin:components.common.lastUpdatedBy', {
            userId: feature.userId,
            updatedAt: toDisplayDateTime(feature.updatedAt)
          })}
        >
          <HiUser className="mx-2" />
        </Tooltip>
      )}
      {additionalProps
        .filter((key) => feature[key])
        .map((key) => (
          <div key={key} className="ml-6 text-sm text-gray-500">
            {key}: {feature[key]}
          </div>
        ))}
    </div>
  )
}

export default FeaturesTab
