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
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { InviteService } from '@ir-engine/client-core/src/social/services/InviteService'
import { useFind, useMutation } from '@ir-engine/common'
import {
  InviteCode,
  InviteData,
  InviteType,
  instancePath,
  invitePath,
  locationPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { convertDateTimeSqlToLocal, toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { useHookstate } from '@ir-engine/hyperflux'
import { Checkbox, Input, RadioGroup } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import MultiEmailInput from '@ir-engine/ui/src/primitives/tailwind/MultiEmailInput'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'

type InviteTypeOptionsType = 'new-user' | 'location' | 'instance'
const inviteTypeOptions = ['new-user', 'location', 'instance'] as InviteTypeOptionsType[]

type SpawnType = 'spawnPoint' | 'userPosition'
const spawnTypeOptions = ['spawnPoint', 'userPosition'] as SpawnType[]

const getDefaultErrors = () => ({
  recipients: '',
  inviteLocation: '',
  inviteInstance: '',
  spawnPoint: '',
  userPosition: '',
  startTime: '',
  endTime: ''
})

export default function AddEditInviteModal({ invite }: { invite?: InviteType }) {
  const { t } = useTranslation()

  const adminLocations = useFind(locationPath, { query: { action: 'admin' } }).data
  const adminInstances = useFind(instancePath).data
  const adminUsers = useFind(userPath, { query: { isGuest: false } }).data
  const patchInvite = useMutation(invitePath).patch

  const emailRecipients = useHookstate(invite?.token ? [invite.token] : ([] as string[]))
  const inviteType = useHookstate<InviteTypeOptionsType>((invite?.inviteType as InviteTypeOptionsType) || 'new-user')
  const oneTimeInvite = useHookstate(invite?.deleteOnUse || false)
  const makeAdmin = useHookstate(invite?.makeAdmin || false)

  const timedInvite = useHookstate(invite?.timed || false)
  const inviteStartTime = useHookstate(invite?.startTime ? convertDateTimeSqlToLocal(invite.startTime) : '')
  const inviteEndTime = useHookstate(invite?.endTime ? convertDateTimeSqlToLocal(invite.endTime) : '')

  const inviteLocation = useHookstate((invite?.inviteType === 'location' && invite.targetObjectId) || '')
  const inviteInstance = useHookstate((invite?.inviteType === 'instance' && invite.targetObjectId) || '')
  const spawnSelected = useHookstate(false)
  const spawnType = useHookstate<SpawnType>((invite?.spawnType as SpawnType) || 'spawnPoint')
  const spawnPoint = useHookstate(invite?.spawnDetails?.spawnPoint || '')
  const userPosition = useHookstate(invite?.spawnDetails?.inviteCode || '')

  const errors = useHookstate(getDefaultErrors())
  const submitLoading = useHookstate(false)

  /** @todo spawn point support */
  const spawnPoints = [] as any[]
  const spawnPointOptions = [
    ...spawnPoints.map(([id, value]) => {
      const transform = value.components.find((component) => component.name === 'transform')
      if (transform) {
        const position = transform.props.position
        return {
          value: id,
          label: `${id} (x: ${position.x}, y: ${position.y}, z: ${position.z})`
        }
      }
      return {
        value: id,
        label: id
      }
    }),
    { value: '', label: t('admin:components.invite.selectSpawnPoint'), disabled: true }
  ]

  const handleSubmit = async () => {
    errors.set(getDefaultErrors())

    if (!emailRecipients.length) {
      errors.recipients.set(t('admin:components.invite.errors.recipients'))
    }
    if (inviteType.value === 'location' && !inviteLocation.value) {
      errors.inviteLocation.set(t('admin:components.invite.errors.inviteLocation'))
    }
    if (inviteType.value === 'instance' && !inviteInstance.value) {
      errors.inviteInstance.set(t('admin:components.invite.errors.inviteInstance'))
    }
    if (timedInvite.value && (!inviteStartTime.value || !inviteEndTime.value)) {
      errors.startTime.set(t('admin:components.invite.errors.startTime'))
      errors.endTime.set(t('admin:components.invite.errors.endTime'))
    }
    if (
      spawnSelected.value &&
      ((inviteType.value === 'location' && inviteLocation.value) ||
        (inviteType.value === 'instance' && inviteInstance.value))
    ) {
      if (spawnType.value === 'spawnPoint' && !spawnPoint.value) {
        errors.spawnPoint.set(t('admin:components.invite.errors.spawnPoint'))
      } else if (spawnType.value === 'userPosition' && !userPosition.value) {
        errors.userPosition.set(t('admin:components.invite.errors.userPosition'))
      }
    }

    if (Object.values(errors.value).some((value) => value.length > 0)) {
      return
    }

    const sendInvitePromises = emailRecipients.value.map(async (email) => {
      const inviteData: InviteData = {
        token: email,
        inviteType: inviteType.value,
        identityProviderType: 'email',
        targetObjectId:
          inviteType.value === 'location'
            ? inviteLocation.value
            : inviteType.value === 'instance'
            ? inviteInstance.value
            : undefined,
        makeAdmin: makeAdmin.value,
        deleteOnUse: oneTimeInvite.value
      }

      if (spawnSelected.value) {
        if (spawnType.value === 'spawnPoint') {
          inviteData.spawnType = 'spawnPoint'
          inviteData.spawnDetails = { spawnPoint: spawnPoint.value }
        } else if (spawnType.value === 'userPosition') {
          inviteData.spawnType = 'inviteCode'
          inviteData.spawnDetails = { inviteCode: userPosition.value as InviteCode }
        }
      }

      if (timedInvite.value) {
        inviteData.timed = true
        inviteData.startTime = toDateTimeSql(new Date(inviteStartTime.value))
        inviteData.endTime = toDateTimeSql(new Date(inviteEndTime.value))
      }

      if (invite?.id) {
        await patchInvite(invite.id, inviteData)
      } else {
        await InviteService.sendInvite(inviteData, '' as InviteCode)
      }
    })

    submitLoading.set(true)

    try {
      await Promise.all(sendInvitePromises)
      PopoverState.hidePopupover()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      submitLoading.set(false)
    }
  }

  return (
    <Modal
      title={invite?.id ? t('admin:components.invite.update') : t('admin:components.invite.create')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={submitLoading.value}
    >
      <div className="relative grid w-full gap-6">
        {invite?.id ? (
          <Input
            labelProps={{
              text: t('admin:components.invite.recipients'),
              position: 'top'
            }}
            value={emailRecipients[0].value}
            onChange={() => {}}
            disabled={true}
          />
        ) : (
          <MultiEmailInput
            emailList={emailRecipients}
            label={t('admin:components.invite.recipients')}
            error={errors.recipients.value}
            disabled={submitLoading.value}
          />
        )}
        <Select
          labelProps={{
            text: t('admin:components.invite.type'),
            position: 'top'
          }}
          options={inviteTypeOptions.map((type) => ({ label: t(`admin:components.invite.${type}`), value: type }))}
          value={inviteType.value}
          onChange={(value: InviteTypeOptionsType) => inviteType.set(value)}
          disabled={submitLoading.value}
        />
        {inviteType.value === 'location' && (
          <Select
            labelProps={{
              text: t('admin:components.invite.location'),
              position: 'top'
            }}
            options={[
              { value: '', label: t('admin:components.invite.selectLocation'), disabled: true },
              ...adminLocations.map((location) => ({
                value: location.id,
                label: location.name
              }))
            ]}
            value={inviteLocation.value}
            onChange={(value: string) => inviteLocation.set(value)}
            state={errors.inviteLocation.value ? 'error' : undefined}
            helperText={errors.inviteLocation.value}
            disabled={submitLoading.value}
          />
        )}
        {inviteType.value === 'instance' && (
          <Select
            labelProps={{
              text: t('admin:components.invite.instance'),
              position: 'top'
            }}
            options={[
              { value: '', label: t('admin:components.invite.selectInstance'), disabled: true },
              ...adminInstances.map((instance) => ({
                label: `${instance.id} (${instance.location.name})`,
                value: instance.id
              }))
            ]}
            value={inviteInstance.value}
            onChange={(value: string) => inviteInstance.set(value)}
            state={errors.inviteInstance.value ? 'error' : undefined}
            helperText={errors.inviteInstance.value}
            disabled={submitLoading.value}
          />
        )}
        {((inviteType.value === 'instance' && inviteInstance.value) ||
          (inviteType.value === 'location' && inviteLocation.value)) && (
          <>
            <Checkbox
              label={t('admin:components.invite.spawnAtPosition')}
              checked={spawnSelected.value}
              onChange={(value) => spawnSelected.set(value)}
              disabled={submitLoading.value}
            />
            {spawnSelected.value && (
              <>
                <RadioGroup
                  horizontal
                  options={spawnTypeOptions.map((option) => ({
                    value: option,
                    label: t(`admin:components.invite.${option}`)
                  }))}
                  value={spawnType.value}
                  onChange={(value) => spawnType.set(value)}
                  disabled={submitLoading.value}
                />
                {spawnType.value === 'spawnPoint' && (
                  <Select
                    labelProps={{
                      text: t('admin:components.invite.spawnPoint'),
                      position: 'top'
                    }}
                    options={spawnPointOptions}
                    value={spawnPoint.value}
                    onChange={(value: string) => spawnPoint.set(value)}
                    disabled={submitLoading.value}
                  />
                )}
                {spawnType.value === 'userPosition' && (
                  <Select
                    labelProps={{
                      text: t('admin:components.invite.userPosition'),
                      position: 'top'
                    }}
                    options={[
                      { label: t('admin:components.invite.selectUserPosition'), value: '', disabled: true },
                      ...adminUsers
                        .filter((user) => user.inviteCode)
                        .map((user) => ({
                          value: user.inviteCode!,
                          label: `${user.name} (${user.inviteCode})`
                        }))
                    ]}
                    value={userPosition.value}
                    onChange={(value: string) => userPosition.set(value)}
                    disabled={submitLoading.value}
                  />
                )}
              </>
            )}
          </>
        )}
        <Checkbox
          label={t('admin:components.invite.oneTime')}
          checked={oneTimeInvite.value}
          onChange={(value) => oneTimeInvite.set(value)}
          disabled={submitLoading.value}
        />
        <Checkbox
          label={t('admin:components.invite.timedInvite')}
          checked={timedInvite.value}
          onChange={(value) => timedInvite.set(value)}
          disabled={submitLoading.value}
        />
        {timedInvite.value && (
          <div className="flex justify-between">
            <Input
              type="datetime-local"
              labelProps={{
                text: t('admin:components.invite.startTime'),
                position: 'top'
              }}
              value={inviteStartTime.value}
              onChange={(event) => inviteStartTime.set(event.target.value)}
              helperText={errors.startTime.value}
              state={errors.startTime.value ? 'error' : undefined}
              disabled={submitLoading.value}
            />
            <Input
              type="datetime-local"
              labelProps={{
                text: t('admin:components.invite.endTime'),
                position: 'top'
              }}
              value={inviteEndTime.value}
              onChange={(event) => inviteEndTime.set(event.target.value)}
              helperText={errors.endTime.value}
              state={errors.endTime.value ? 'error' : undefined}
              disabled={submitLoading.value}
            />
          </div>
        )}
        {inviteType.value === 'new-user' && (
          <Checkbox
            label={t('admin:components.invite.makeAdmin')}
            checked={makeAdmin.value}
            onChange={(value) => makeAdmin.set(value)}
            disabled={submitLoading.value}
          />
        )}
      </div>
    </Modal>
  )
}
