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
import { EngineSettingType, engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { flattenObjectToArray, unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { useHookstate } from '@ir-engine/hyperflux'
import { AwsConfig } from '@ir-engine/server-core/src/appconfig'
import { Button, Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
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
  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })
  const patchAwsSettings = useMutation(engineSettingPath)
  const engineSettingData = useFind(engineSettingPath, {
    query: {
      category: 'aws',
      paginate: false
    }
  })
  const awsSettings = unflattenArrayToObject(
    engineSettingData.data.map((el) => ({ key: el.key, value: el.value, dataType: el.dataType }))
  ) as AwsConfig

  const sms = useHookstate(awsSettings?.sms)
  const s3 = useHookstate(awsSettings?.s3)
  const eks = useHookstate(awsSettings?.eks)
  const cloudfront = useHookstate(awsSettings?.cloudfront)

  useEffect(() => {
    if (engineSettingData.status == 'success') {
      sms.set(awsSettings.sms)
      cloudfront.set(awsSettings.cloudfront)
      s3.set(awsSettings.s3)
      eks.set(awsSettings.eks)
    }
  }, [engineSettingData.status])

  const handleSubmit = (event) => {
    state.loading.set(true)
    event.preventDefault()

    const updatedSettings = flattenObjectToArray({
      sms: sms.value,
      cloudfront: cloudfront.value
    })
    const awsOperationPromises: Promise<EngineSettingType | EngineSettingType[]>[] = []

    updatedSettings.forEach((setting) => {
      const settingInDb = engineSettingData.data.find((el) => el.key === setting.key)
      if (!settingInDb) {
        awsOperationPromises.push(
          patchAwsSettings.create({
            key: setting.key,
            category: 'aws',
            dataType: getDataType(setting.value),
            value: `${setting.value}`,
            type: 'private'
          })
        )
      } else if (settingInDb.value != setting.value) {
        awsOperationPromises.push(
          patchAwsSettings.patch(settingInDb.id, {
            key: setting.key,
            category: 'aws',
            dataType: getDataType(setting.value),
            value: setting.value,
            type: 'private'
          })
        )
      }
    })

    Promise.all(awsOperationPromises)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    sms.set(awsSettings.sms)
    cloudfront.set(awsSettings.cloudfront)
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
          value={eks?.value?.accessKeyId || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.secretAccessKey'),
            position: 'top'
          }}
          value={eks?.value?.secretAccessKey || ''}
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
          value={s3?.value?.accessKeyId || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.secretAccessKey'),
            position: 'top'
          }}
          value={s3?.value?.secretAccessKey || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.endpoint'),
            position: 'top'
          }}
          value={s3?.value?.endpoint || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.staticResourceBucket'),
            position: 'top'
          }}
          value={s3?.value?.staticResourceBucket || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.region'),
            position: 'top'
          }}
          value={s3?.value?.region || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.avatarDir'),
            position: 'top'
          }}
          value={s3?.value?.avatarDir || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.s3DevMode'),
            position: 'top'
          }}
          value={s3?.value?.s3DevMode || ''}
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
      {state.errorMessage.value && (
        <div className="col-span-full">
          <Text component="h3" className="text-red-700">
            {state.errorMessage.value}
          </Text>
        </div>
      )}
      <div className="grid grid-cols-8 gap-6">
        <Button size="sm" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
          {t('admin:components.common.reset')}
        </Button>
        <Button size="sm" variant="primary" className="col-span-1" fullWidth onClick={handleSubmit}>
          {t('admin:components.common.save')}
          {state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
        </Button>
      </div>
    </Accordion>
  )
})

export default AwsTab
