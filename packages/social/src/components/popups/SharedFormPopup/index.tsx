import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { usePopupsStateState } from '@xrengine/client-core/src/social/reducers/popupsState/PopupsStateState'
import { PopupsStateService } from '@xrengine/client-core/src/social/reducers/popupsState/PopupsStateService'
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
    dispatch(PopupsStateService.updateShareFormState(false))
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
