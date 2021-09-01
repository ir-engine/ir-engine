import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectPopupsState } from '../../../reducers/popupsState/selector'
import { updateCreatorPageState } from '../../../reducers/popupsState/service'
import Creator from '../../Creator'
import SharedModal from '../../SharedModal'
import AppFooter from '../../Footer'
import styles from './CreatorPopup.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch)
})

interface Props {
  popupsState?: any
  updateCreatorPageState?: typeof updateCreatorPageState
  webxrRecorderActivity?: any
}
export const CreatorPopup = ({ popupsState, updateCreatorPageState, webxrRecorderActivity }: Props) => {
  const creatorPageState = popupsState?.get('creatorPage')
  const creatorId = popupsState?.get('creatorId')
  const handleCreatorClose = () => updateCreatorPageState(false)
  const renderCreatorModal = () =>
    popupsState?.get('creatorPage') === true &&
    popupsState?.get('creatorId') &&
    !webxrRecorderActivity && (
      <SharedModal open={popupsState?.get('creatorPage')} onClose={handleCreatorClose} className={styles.creatorPopup}>
        <Creator creatorId={popupsState?.get('creatorId')} />
        <AppFooter />
      </SharedModal>
    )
  useEffect(() => {
    renderCreatorModal()
  }, [creatorPageState, creatorId])
  return renderCreatorModal()
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorPopup)
