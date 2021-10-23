import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { usePopupsStateState } from '@xrengine/client-core/src/social/state/PopupsStateState'
import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
import SharedModal from '../../SharedModal'
import AppFooter from '../../Footer'

//@ts-ignore
import styles from './CreatorFormPopup.module.scss'
import CreatorForm from '../../CreatorForm'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'

interface Props {
  webxrRecorderActivity: any
  setView?: any
}
export const CreatorFormPopup = ({ webxrRecorderActivity, setView }: Props) => {
  const dispatch = useDispatch()

  const popupsState = usePopupsStateState()

  //common for creator form
  const handleCreatorFormClose = () => {
    PopupsStateService.updateCreatorFormState(false)
  }
  const platformClass = isIOS ? styles.isIos : ''

  const renderCreatoFormModal = () =>
    popupsState?.popups?.creatorForm?.value === true &&
    !webxrRecorderActivity && (
      <SharedModal
        open={popupsState?.popups?.creatorForm?.value}
        onClose={handleCreatorFormClose}
        className={styles.creatorFormPopup + ' ' + platformClass}
      >
        <CreatorForm />
        <AppFooter setView={setView} />
      </SharedModal>
    )

  useEffect(() => {
    renderCreatoFormModal()
  }, [popupsState?.popups.creatorForm.value])
  return renderCreatoFormModal()
}

export default CreatorFormPopup
