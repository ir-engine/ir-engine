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

import React from 'react'

import { useMutation } from '@ir-engine/common'
import {
  type AbuseReasonsType,
  LocationID,
  moderationFileUploadPath,
  moderationPath,
  type ModerationTypeType
} from '@ir-engine/common/src/schema.type.module'

import { ABUSE_REASONS } from '@ir-engine/common/src/constants/ModerationConstants'
import { useHookstate, UserID } from '@ir-engine/hyperflux'
import { Button, Select } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import TextArea from '@ir-engine/ui/src/primitives/tailwind/TextArea'
import { t } from 'i18next'
import { IoCloseOutline } from 'react-icons/io5'
import { twMerge } from 'tailwind-merge'
import { NotificationService } from '../../common/services/NotificationService'
import { PopoverState } from '../../common/services/PopoverState'
import { uploadToFeathersService } from '../../util/upload'

type ReportMenuProps = { type: ModerationTypeType; userId?: UserID; locationId?: LocationID }

const ReportSuccessReportModal = ({ handleClose }) => (
  <Modal
    id="report-success-modal"
    className="pointer-events-auto m-auto flex h-auto w-[750px] rounded-xl bg-surface-1 [&>div]:flex [&>div]:w-full [&>div]:flex-col"
    hideFooter={true}
    rawChildren={
      <div className="flex w-full flex-col items-center gap-6 p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-400">
          <span className="text-2xl text-text-secondary">✓</span>
        </div>
        <span className="text-center text-text-secondary">
          {t('user:usermenu.profile.reportSuccessMessage') as string}
        </span>
        <Button onClick={handleClose}>Close</Button>
      </div>
    }
  />
)

const ReportMenu = (props: ReportMenuProps) => {
  const { type } = props
  const reportedUserId = type === 'user' ? props.userId : undefined
  const typeReport = type === 'user' ? 'user' : 'location'
  const reportedLocationId = props.locationId
  const userReportsMutation = useMutation(moderationPath)
  const handleClose = async () => {
    PopoverState.hidePopupover()
  }

  const formData = useHookstate({
    abuseType: 'null' as AbuseReasonsType,
    details: '',
    files: [] as File[]
  })

  const errors = useHookstate({
    abuseType: '',
    details: '',
    files: ''
  })

  const fieldOptions = {
    abuseType: {
      label: t('user:usermenu.profile.typeAbuse'),
      validate: (input: string) => {
        if (input === 'null') {
          errors.abuseType.set(t('user:usermenu.profile.selectAbuseTypeRequired'))
          return false
        }
        errors.abuseType.set('')
        return true
      }
    },
    details: {
      label: t('user:usermenu.profile.reportDetails'),
      placeholder: t('user:usermenu.profile.reportDetailsPlaceholder'),
      validate: () => {
        if (formData.details.value.trim().length === 0) {
          errors.details.set(t('user:usermenu.profile.reportDetailsRequired'))
          return false
        }
        errors.details.set('')
        return true
      }
    },
    files: {
      buttonLabel: t('user:common.upload'),
      label: t('user:usermenu.profile.reportFileLabel'),
      validate: () => {
        if (formData.files.value.length === 0) {
          errors.files.set(t('user:usermenu.profile.reportFileRequired'))
          return false
        }
        errors.files.set('')
        return true
      }
    }
  }

  const abuseTypes = [
    {
      value: 'null',
      label: t('user:usermenu.profile.selectOne') as string
    },
    ...ABUSE_REASONS.map((abuseReason) => ({
      value: abuseReason,
      label: t(`user:moderation.abuseReason.${abuseReason}`) as string
    }))
  ]
  const handleChange = (newValue: string, name: string) => {
    formData[name].set(newValue)
    fieldOptions[name].validate(newValue)
  }

  const handleSubmit = async () => {
    if (
      !fieldOptions.abuseType.validate(formData.value.abuseType) ||
      !fieldOptions.details.validate() ||
      !fieldOptions.files.validate()
    ) {
      return
    }
    try {
      const report = await userReportsMutation.create({
        type,
        abuseReason: formData.abuseType.value,
        reportDetails: formData.details.value,
        reportedUserId,
        reportedLocationId: reportedLocationId!
      })
      const args = [
        {
          moderationId: report.id
        }
      ]
      if (formData.files && formData.files.value.length > 0) {
        await Promise.all(
          formData.files.value.map(
            (file) => uploadToFeathersService(moderationFileUploadPath, [file], { args }).promise
          )
        )
      }
      handleClose()
      PopoverState.showPopupover(<ReportSuccessReportModal handleClose={handleClose} />)
    } catch (error) {
      handleClose()
      NotificationService.dispatchNotify(`Something went wrong Reporting a ${typeReport}`, {
        variant: 'error'
      })
      console.error('Error uploading file', error.message)
    }
  }

  return (
    <Modal
      id="select-report-menu-modal"
      className="pointer-events-auto m-auto flex h-auto w-[750px] rounded-xl bg-surface-1 [&>div]:flex [&>div]:w-full [&>div]:flex-col"
      hideFooter={true}
      rawChildren={
        <div className="flex w-full flex-col">
          <div className="border-b-theme-primary flex h-14 items-center justify-between border-b px-8">
            <Text fontSize="sm" fontWeight="semibold" className="flex-1 text-center text-text-secondary">
              {t('user:usermenu.profile.report', { type: typeReport }) as string}
            </Text>
            <Button
              data-testid="close-button"
              className="h-6 w-6 bg-transparent hover:bg-transparent focus:bg-transparent"
              onClick={handleClose}
            >
              <span>
                <IoCloseOutline className="text-text-secondary" size={20} />
              </span>
            </Button>
          </div>

          <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
              <Select
                required
                width="full"
                labelProps={{
                  position: 'top',
                  text: fieldOptions.abuseType.label
                }}
                value={formData.abuseType.value}
                options={abuseTypes}
                state={errors.abuseType.value ? 'error' : undefined}
                helperText={errors.abuseType.value}
                onChange={(event) => handleChange(event.toString(), 'abuseType')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <TextArea
                required
                containerClassName="text-text-secondary"
                labelClassname="text-xs text-text-secondary"
                label={fieldOptions.details.label}
                value={formData.details.value || ''}
                onChange={(e) => handleChange(e.target.value, 'details')}
                placeholder={fieldOptions.details.placeholder}
                className={twMerge('min-h-[120px] w-full', errors.details.value && 'border-red-700')}
              />
              {errors.details.value && <span className="text-xs text-red-700">{errors.details.value}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <Text fontSize="xs" className="text-text-secondary">
                <span className="text-red-700">*</span>
                {fieldOptions.files.label}
              </Text>
              <div className="flex items-center gap-2">
                <input
                  required
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 2) {
                      NotificationService.dispatchNotify('Maximum 2 files allowed', { variant: 'warning' })
                    }
                    const files = Array.from(e.target.files || []).slice(0, 2) // Limit to first 2 files
                    formData.files.set(files)
                    fieldOptions.files.validate()
                  }}
                />
                <Button onClick={() => document.getElementById('file-upload')?.click()}>
                  {fieldOptions.files.buttonLabel}
                </Button>

                {formData.files.length > 0 && (
                  <Text fontSize="sm" className="text-text-secondary">
                    {formData.files.length} file(s) selected
                  </Text>
                )}
                {errors.files.value && (
                  <Text fontSize="xs" className="text-red-700">
                    {errors.files.value}
                  </Text>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <Button variant="secondary" onClick={handleClose}>
                {t('common:components.cancel') as string}
              </Button>
              <Button onClick={handleSubmit}>{t('common:components.submit') as string}</Button>
            </div>
          </div>
        </div>
      }
    />
  )
}

export default ReportMenu
