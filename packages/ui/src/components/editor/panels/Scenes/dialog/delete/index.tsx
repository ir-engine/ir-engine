import { isDev } from '@etherealengine/common/src/config'
import React, { MouseEventHandler } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../../primitives/tailwind/Button'

interface Props {
  open: boolean
  isProjectMenu?: boolean
  onClose: (e: any, reason: string) => void
  onConfirm: MouseEventHandler<HTMLButtonElement>
  onCancel: MouseEventHandler<HTMLButtonElement>
}

export const DeleteDialog = (props: Props): JSX.Element => {
  const { t } = useTranslation()

  const dialogTitle =
    props.isProjectMenu && isDev ? t('editor:dialog.delete.not-allowed-local-dev') : t('editor:dialog.sure-confirm')

  return (
    <div className={`fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 ${props.open ? 'block' : 'hidden'}`}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-[300px] rounded-lg bg-white p-4 shadow-lg">
          <div className="mb-4 text-lg font-bold">{dialogTitle}</div>
          <div className="flex justify-end">
            <Button onClick={props.onCancel} className="mr-2.5 px-4 py-2 text-sm">
              {t('editor:dialog.lbl-cancel')}
            </Button>
            <Button
              disabled={props.isProjectMenu && isDev}
              className="bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:pointer-events-none disabled:bg-gray-400"
              onClick={props.onConfirm}
              autoFocus
            >
              {t('editor:dialog.lbl-confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteDialog
