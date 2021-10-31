import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { usePopupsStateState } from '@xrengine/client-core/src/social/services/PopupsStateService'
import { PopupsStateService } from '@xrengine/client-core/src/social/services/PopupsStateService'
import SharedModal from '../../SharedModal'
import AppFooter from '../../Footer'
import ShareForm from '../../ShareForm/ShareForm'

//@ts-ignore
import styles from './SharedFormPopup.module.scss'

interface Props {
  setView?: any
}
export const SharedFormPopup = ({ setView }: Props) => {
  const dispatch = useDispatch()
  const popupsState = usePopupsStateState()
  //common for share form page
  const handleShareFormClose = () => {
    PopupsStateService.updateShareFormState(false)
  }
  const renderShareFormModal = () =>
    popupsState?.popups?.shareForm?.value === true && (
      <SharedModal
        open={popupsState?.popups.shareForm.value}
        onClose={handleShareFormClose}
        className={styles.shareFormPopup}
      >
        <ShareForm />
        <div className={styles.popUpFooter}>
          <AppFooter setView={setView} />
        </div>
      </SharedModal>
    )

  useEffect(() => {
    renderShareFormModal()
  }, [popupsState?.popups.shareForm?.value])
  return renderShareFormModal()
}

export default SharedFormPopup
