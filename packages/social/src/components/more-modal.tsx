import React from 'react'
import { Modal } from './Modal'
import { ModalStateHook } from './ModalHook'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
export function MoreModalItems() {
  const { modalData } = ModalStateHook()
  const data = modalData
  const history = useHistory()
  const { t } = useTranslation()
  return (
    <Modal>
      <button
        type="button"
        className="modal-box-item h-12 bg-white w-full text-14-bold text-red"
        onClick={() => console.log('test')}
      >
        {t('social:reportInApporpriate')}
      </button>
      <button type="button" className="modal-box-item h-12 bg-white w-full text-14-bold text-red">
        {t('social:unfollow')}
      </button>
      <button
        type="button"
        className="modal-box-item h-12 bg-white w-full text-14-light"
        onClick={() => history.push(`/post/${(data as any).pid}`)}
      >
        {t('social:goToPost')}
      </button>
      <button type="button" className="modal-box-item h-12 bg-white w-full text-14-light">
        {t('social:shareModal')}
      </button>
      <button type="button" className="modal-box-item h-12 bg-white w-full text-14-light">
        {t('social:copyLink')}
      </button>
      <button type="button" className="modal-box-item h-12 bg-white w-full text-14-light">
        {t('social:embed')}
      </button>
      <button type="button" className="modal-box-item h-12 bg-white w-full text-14-light">
        {t('social:cancel')}
      </button>
    </Modal>
  )
}
