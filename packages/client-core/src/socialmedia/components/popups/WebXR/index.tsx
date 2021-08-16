import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectPopupsState } from '../../../reducers/popupsState/selector'
import { updateWebXRState } from '../../../reducers/popupsState/service'
import WebXRPlugin from '../../WebXRPlugin'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateWebXRState: bindActionCreators(updateWebXRState, dispatch)
})

interface Props {
  popupsState?: any
  updateWebXRState?: typeof updateWebXRState
  setContentHidden?: any
  feedHintsOnborded?: any
  setFeedHintsOnborded?: any
  webxrRecorderActivity?: any
}
export const WebXRStart = ({
  popupsState,
  webxrRecorderActivity,
  feedHintsOnborded,
  setFeedHintsOnborded,
  setContentHidden
}: Props) => {
  //common for web xr

  const renderWebXRModal = () =>
    popupsState?.get('webxr') === true && (
      <div>
        <WebXRPlugin
          feedHintsOnborded={feedHintsOnborded}
          setFeedHintsOnborded={setFeedHintsOnborded}
          setContentHidden={setContentHidden}
          webxrRecorderActivity={webxrRecorderActivity}
        />
      </div>
    )

  const webXRstate = popupsState?.get('webxr')
  useEffect(() => {
    renderWebXRModal()
  }, [webXRstate])
  return renderWebXRModal()
}

export default connect(mapStateToProps, mapDispatchToProps)(WebXRStart)
