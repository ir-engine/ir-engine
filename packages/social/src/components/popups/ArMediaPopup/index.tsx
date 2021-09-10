import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectPopupsState } from '../../../reducers/popupsState/selector'
import { updateArMediaState } from '../../../reducers/popupsState/service'
import ArMedia from '../../ArMedia'
import SharedModal from '../../SharedModal'
import styles from './ArMediaPopup.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateArMediaState: bindActionCreators(updateArMediaState, dispatch)
})

interface Props {
  popupsState?: any
  updateArMediaState?: typeof updateArMediaState
}
export const ArMediaPopup = ({ popupsState, updateArMediaState }: Props) => {
  //common for ArMedia choose
  const handleArMediamClose = () => updateArMediaState(false)
  const renderArMediaModal = () =>
    popupsState?.get('arMedia') === true && (
      <SharedModal open={popupsState?.get('arMedia')} onClose={handleArMediamClose} className={styles.arMediaPopup}>
        <ArMedia />
      </SharedModal>
    )

  const arMediaState = popupsState?.get('arMedia')
  useEffect(() => {
    renderArMediaModal()
  }, [arMediaState])
  return renderArMediaModal()
}

export default connect(mapStateToProps, mapDispatchToProps)(ArMediaPopup)
