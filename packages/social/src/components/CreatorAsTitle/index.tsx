/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import Typography from '@material-ui/core/Typography'
import CardHeader from '@material-ui/core/CardHeader'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import Avatar from '@material-ui/core/Avatar'

import { updateCreatorPageState } from '../../reducers/popupsState/service'
import { selectPopupsState } from '../../reducers/popupsState/selector'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch)
})

interface Props {
  creator?: any
  popupsState?: any
  updateCreatorPageState?: typeof updateCreatorPageState
}
const CreatorAsTitle = ({ creator, updateCreatorPageState, popupsState }: Props) => {
  return creator ? (
    <CardHeader
      avatar={
        <Avatar
          src={creator.avatar}
          alt={creator.username}
          onClick={() => {
            if (popupsState.get('creatorPage') === true) {
              updateCreatorPageState(false)
              const intervalDelay = setTimeout(() => {
                clearInterval(intervalDelay)
                updateCreatorPageState(true, creator.id)
              }, 100)
            } else {
              updateCreatorPageState(true, creator.id)
            }
          }}
        />
      }
      title={
        <Typography variant="h6">
          {creator.username}
          {creator.verified === true && (
            <VerifiedUserIcon htmlColor="#007AFF" style={{ fontSize: '13px', margin: '0 0 0 5px' }} />
          )}
        </Typography>
      }
    />
  ) : (
    <></>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorAsTitle)
