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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useMutation } from '@ir-engine/common'
import { ABUSE_REASONS } from '@ir-engine/common/src/constants/ModerationConstants'
import {
  moderationFileUploadPath,
  moderationPath,
  type AbuseReasonsType,
  type ModerationTypeType
} from '@ir-engine/common/src/schema.type.module'
import { NetworkState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { CheckLg } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import TextArea from '@ir-engine/ui/src/primitives/tailwind/TextArea'
import { Dropdown } from '@ir-engine/ui/viewer'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { NotificationService } from '../../common/services/NotificationService'
import { LocationState } from '../../social/services/LocationService'
import { ReportUserState } from '../../util/ReportUserState'
import { uploadToFeathersService } from '../../util/upload'
import { smallIconButtonStyles } from '../Glass/Buttons'

const backButtonStyles = `
  left-4
`

const actionButtonStyles = `
  flex h-10 px-10 py-1 justify-center 
  items-center self-stretch
  text-white
  rounded-full
  bg-[rgba(255,255,255,0.2)]
  shadow-[inset_0px_1px_1px_rgba(255,255,255,0.25),inset_0px_-1px_1px_rgba(255,255,255,0.1),0px_8px_6px_rgba(0,0,0,0.05)]
`

const baseContainerStyles = `
  flex flex-col
  text-white
`

const containerStyles = twMerge(baseContainerStyles, 'gap-y-6')

const inputContainerStyles = twMerge(baseContainerStyles, 'gap-y-2')

type ReportMenuProps = { type: ModerationTypeType }

const REPORT_INPROGRESS = 'REPORT_INPROGRESS'
const REPORT_SUCCESS = 'REPORT_SUCCESS'

const ReportUserMenu = (props: ReportMenuProps) => {
  const { t } = useTranslation()
  const { type } = props
  const { reportedPeerId } = useMutableState(ReportUserState)
  const reportedUserId = type === 'user' ? NetworkState.mediaNetwork?.peers?.[reportedPeerId.value!]?.userId : undefined
  const typeReport = type === 'location' ? 'Location' : 'User'
  const currentLocation = getState(LocationState).currentLocation.location
  const reportedLocationId = currentLocation.id
  const userReportsMutation = useMutation(moderationPath)

  const [content, setContent] = useState<string>(REPORT_INPROGRESS) // REPORT_INPROGRESS | REPORT_SUCCESS
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  /** may need to move this to its own provider if used in more than several areas */
  const fieldOptions = {
    abuseType: {
      label: t('user:usermenu.profile.typeAbuse'),
      validate: (input: string) => {
        input = input.trim()
        if (input === null || input === '' || input === 'null') {
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
      buttonLabel: t('user:common.attach'),
      label: t('user:usermenu.profile.reportFileLabel'),
      validate: () => {
        // this is optional
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
    if (!fieldOptions.abuseType.validate(formData.value.abuseType) || !fieldOptions.details.validate()) {
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
      setContent(REPORT_SUCCESS)
    } catch (error) {
      NotificationService.dispatchNotify(`Something went wrong Reporting a ${typeReport}`, {
        variant: 'error'
      })
      console.error('Error uploading file', error.message)
    }
  }

  const onClose = () => {
    ReportUserState.resetPeerId()
    setContent(REPORT_INPROGRESS)
    handleChange('', 'abuseType')
    handleChange('', 'details')
    errors.abuseType.set('')
    errors.details.set('')
  }

  const reportProgress = (
    <div className={containerStyles}>
      <div className={inputContainerStyles}>
        <Text fontSize="xs" className="text-white">
          {fieldOptions.abuseType.label}
        </Text>
        <Dropdown
          backgroundColor="black"
          border={false}
          placeholder="Select one"
          value={formData.abuseType.value}
          options={abuseTypes}
          onChange={(event) => handleChange(event.toString(), 'abuseType')}
        />
        {errors.abuseType.value && <span className="text-xs text-ui-error">{errors.abuseType.value}</span>}
      </div>

      <div className={inputContainerStyles}>
        <Text fontSize="xs" className="text-white">
          {fieldOptions.details.label}
        </Text>
        <TextArea
          required
          containerClassName="text-white"
          labelClassname="text-xs text-white"
          value={formData.details.value || ''}
          onChange={(e) => handleChange(e.target.value, 'details')}
          placeholder={fieldOptions.details.placeholder}
          className={twMerge(
            'transparent-1/2 min-h-[120px] w-full border-0 bg-black/20 backdrop-blur-xl',
            errors.details.value && 'border-ui-error'
          )}
        />
        {errors.details.value && <span className="text-xs text-ui-error">{errors.details.value}</span>}
      </div>

      <div className={inputContainerStyles}>
        <Text fontSize="xs" className="text-white">
          {fieldOptions.files.label}
        </Text>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
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
          <button className={actionButtonStyles} onClick={() => fileInputRef.current?.click()}>
            {fieldOptions.files.buttonLabel}
          </button>

          {formData.files.length > 0 && (
            <Text fontSize="sm" className="text-white">
              {formData.files.length} file(s) selected
            </Text>
          )}
          {errors.files.value && (
            <Text fontSize="xs" className="text-ui-error">
              {errors.files.value}
            </Text>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse justify-between gap-4 pt-4 md:flex-row">
        <button className={actionButtonStyles} onClick={onClose}>
          {t('common:components.cancel')}
        </button>
        <button className={actionButtonStyles} onClick={handleSubmit}>
          {t('common:components.submit')}
        </button>
      </div>
    </div>
  )

  const reportSucess = (
    <div className="relative flex h-screen w-full flex-col items-center justify-center gap-4 text-center text-white">
      <div className="block">
        <button className={twMerge(smallIconButtonStyles, backButtonStyles, `shadow`)}>
          <CheckLg fontSize={'lg'} />
        </button>
      </div>
      <div
        className="text-center font-['DM_Sans'] text-[1.25rem] font-medium leading-[1.875rem] tracking-[-0.014rem] text-white"
        style={{
          textShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)'
        }}
      >
        {t('user:usermenu.profile.reportSuccessMessage')}
      </div>
      <div className="absolute bottom-20 left-0 z-50 flex w-full justify-center">
        <button className={twMerge(actionButtonStyles, 'px-20')} onClick={onClose}>
          {t('common:components.close')}
        </button>
      </div>
    </div>
  )

  const showContents = () => {
    switch (content) {
      case REPORT_INPROGRESS:
        return reportProgress
      case REPORT_SUCCESS:
        return reportSucess
      default:
        return reportProgress
    }
  }

  return <div className="w-full">{showContents()}</div>
}

export default ReportUserMenu
