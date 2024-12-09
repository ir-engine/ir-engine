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
import { AwsCloudFrontType, AwsSmsType, awsSettingPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

const SMS_PROPERTIES = {
  ACCESS_KEY_ID: 'accessKeyId',
  APPLICATION_ID: 'applicationId',
  REGION: 'region',
  SENDER_ID: 'senderId',
  SECRET_ACCESS_KEY: 'secretAccessKey'
}

const CLOUDFRONT_PROPERTIES = {
  DOMAIN: 'domain',
  DISTRIBUTION_ID: 'distributionId',
  REGION: 'region'
}

const AwsTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const patchAwsSettings = useMutation(awsSettingPath).patch
  const adminAwsSettingsData = useFind(awsSettingPath).data.at(0)

  const id = adminAwsSettingsData?.id
  const sms = useHookstate(adminAwsSettingsData?.sms)
  const cloudfront = useHookstate(adminAwsSettingsData?.cloudfront)

  useEffect(() => {
    if (!adminAwsSettingsData) {
      return
    }
    const tempSms = JSON.parse(JSON.stringify(adminAwsSettingsData.sms)) as AwsSmsType
    const tempCloudfront = JSON.parse(JSON.stringify(adminAwsSettingsData.cloudfront)) as AwsCloudFrontType
    sms.set(tempSms)
    cloudfront.set(tempCloudfront)
  }, [adminAwsSettingsData])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!id) return

    patchAwsSettings(id, { sms: sms.value, cloudfront: cloudfront.value })
  }

  const handleCancel = () => {
    const tempSms = JSON.parse(JSON.stringify(adminAwsSettingsData?.sms)) as AwsSmsType
    const tempCloudfront = JSON.parse(JSON.stringify(adminAwsSettingsData?.cloudfront)) as AwsCloudFrontType
    sms.set(tempSms)
    cloudfront.set(tempCloudfront)
  }

  const handleUpdateCloudfront = (event, type) => {
    cloudfront.set({
      ...JSON.parse(JSON.stringify(cloudfront.value)),
      [type]: event.target.value
    })
  }

  const handleUpdateSms = (event, type) => {
    sms.set({
      ...JSON.parse(JSON.stringify(sms.value)),
      [type]: event.target.value
    })
  }

  return (
    <Accordion
      title={t('admin:components.setting.aws.header')}
      subtitle={t('admin:components.setting.aws.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.eks')}
        </Text>

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.accessKeyId'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.eks?.accessKeyId || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.secretAccessKey'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.eks?.secretAccessKey || ''}
          disabled
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.s3')}
        </Text>

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.accessKeyId'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.s3?.accessKeyId || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.secretAccessKey'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.s3?.secretAccessKey || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.endpoint'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.s3?.endpoint || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.staticResourceBucket'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.s3?.staticResourceBucket || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.region'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.s3?.region || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.avatarDir'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.s3?.avatarDir || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.s3DevMode'),
            position: 'top'
          }}
          value={adminAwsSettingsData?.s3?.s3DevMode || ''}
          disabled
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.cloudFront')}
        </Text>
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.domain'),
            position: 'top'
          }}
          value={cloudfront?.value?.domain || ''}
          onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.DOMAIN)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.distributionId'),
            position: 'top'
          }}
          value={cloudfront?.value?.distributionId || ''}
          onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.DISTRIBUTION_ID)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.region'),
            position: 'top'
          }}
          value={cloudfront?.value?.region || ''}
          onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.REGION)}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.sms')}
        </Text>
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.accessKeyId'),
            position: 'top'
          }}
          value={sms?.value?.accessKeyId || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.ACCESS_KEY_ID)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.applicationId'),
            position: 'top'
          }}
          value={sms?.value?.applicationId || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.APPLICATION_ID)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.region'),
            position: 'top'
          }}
          value={sms?.value?.region || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.REGION)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.senderId'),
            position: 'top'
          }}
          value={sms?.value?.senderId || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SENDER_ID)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.secretAccessKey'),
            position: 'top'
          }}
          value={sms?.value?.secretAccessKey || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SECRET_ACCESS_KEY)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
        <Button size="sm" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
          {t('admin:components.common.reset')}
        </Button>
        <Button size="sm" variant="primary" className="col-span-1" fullWidth onClick={handleSubmit}>
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default AwsTab
