import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GoAlert } from 'react-icons/go'
import { PopoverState } from '../../../../common/services/PopoverState'

interface Props {
  handleConfirm: () => void
  handleCancel?: () => void
}

export const DiscardAvatarChangesModal = ({ handleConfirm, handleCancel }: Props) => {
  const { t } = useTranslation()

  const handleClose = () => {
    PopoverState.hidePopupover()
    if (handleCancel) handleCancel()
  }

  return (
    <Modal
      className="max-h-1/3 pointer-events-auto h-fit w-1/4 rounded-lg"
      hideFooter
      rawChildren={
        <div className="flex flex-col p-6 text-center">
          <div className="mx-auto mb-12 flex h-14 w-14 rounded-full bg-[#191b1f]">
            <GoAlert className="m-auto text-3xl text-[#C3324B]" />
          </div>
          <Text fontSize="xl" fontWeight="bold" className="capitalize">
            {t('user:avatar.discardAvatarChanges')}
          </Text>
          <Text fontSize="base" className="mt-2 text-theme-secondary">
            {t('user:common.changesLostAlert')}
          </Text>

          <div className="mt-10 flex justify-center">
            <Button className="text-sm" onClick={handleClose}>
              {t('common:components.back')}
            </Button>
            <Button className="ml-2 text-sm" onClick={handleConfirm}>
              {t('user:common.discard')}
            </Button>
          </div>
        </div>
      }
    />
  )
}
