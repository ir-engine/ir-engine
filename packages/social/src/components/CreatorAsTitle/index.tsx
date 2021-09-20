/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { Typography, CardHeader, Avatar, IconButton } from '@material-ui/core'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import DeleteIcon from '@material-ui/icons/Delete'

import { updateCreatorPageState } from '../../reducers/popupsState/service'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { unBlockCreator } from '../../reducers/creator/service'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
  unBlockCreator: bindActionCreators(unBlockCreator, dispatch)
})

interface Props {
  creator?: any
  popupsState?: any
  updateCreatorPageState?: typeof updateCreatorPageState
}
const CreatorAsTitle = ({ creator, updateCreatorPageState, unBlockCreator, popupsState }: any) => {
  const removeBlockedUser = (blokedCreatorId) => {
    unBlockCreator(blokedCreatorId)
  }

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6">
            {creator.username}
            {creator.verified === true && (
              <VerifiedUserIcon htmlColor="#007AFF" style={{ fontSize: '13px', margin: '0 0 0 5px' }} />
            )}
          </Typography>
          <IconButton aria-label="delete" color="primary" onClick={() => removeBlockedUser(creator.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      }
    />
  ) : (
    <></>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorAsTitle)
