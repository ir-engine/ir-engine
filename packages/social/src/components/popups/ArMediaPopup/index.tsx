import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { usePopupsStateState } from '@xrengine/client-core/src/social/reducers/popupsState/PopupsStateState'
import { PopupsStateService } from '@xrengine/client-core/src/social/reducers/popupsState/PopupsStateService'
import ArMedia from '../../ArMedia'
import SharedModal from '../../SharedModal'
import styles from './ArMediaPopup.module.scss'

interface Props {}

export const ArMediaPopup = (props: Props) => {
  const popupsState = usePopupsStateState()
  const dispatch = useDispatch()
  //common for ArMedia choose
  const handleArMediamClose = () => {
    dispatch(PopupsStateService.updateArMediaState(false))
  }
  const renderArMediaModal = () =>
    popupsState?.popups.arMedia?.value === true && (
      <SharedModal
        open={popupsState?.popups.arMedia?.value}
        onClose={handleArMediamClose}
        className={styles.arMediaPopup}
      >
        <ArMedia />
      </SharedModal>
    )

  useEffect(() => {
    renderArMediaModal()
  }, [popupsState?.popups?.arMedia?.value])
  return renderArMediaModal()
}

export default ArMediaPopup
