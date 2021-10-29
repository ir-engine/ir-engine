/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { Typography, CardHeader, Avatar, IconButton } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import DeleteIcon from '@mui/icons-material/Delete'

import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
import { usePopupsStateState } from '@xrengine/client-core/src/social/state/PopupsStateService'
import { CreatorService } from '@xrengine/client-core/src/social/state/CreatorService'

interface Props {
  creator?: any
}

const CreatorAsTitle = ({ creator }: any) => {
  const dispatch = useDispatch()
  const popupsState = usePopupsStateState()
  const removeBlockedUser = (blokedCreatorId) => {
    CreatorService.unBlockCreator(blokedCreatorId)
  }

  return creator ? (
    <CardHeader
      avatar={
        <Avatar
          src={creator.avatar}
          alt={creator.username}
          onClick={() => {
            if (popupsState.popups.creatorPage?.value === true) {
              PopupsStateService.updateCreatorPageState(false)
              const intervalDelay = setTimeout(() => {
                clearInterval(intervalDelay)
                PopupsStateService.updateCreatorPageState(true, creator.id)
              }, 100)
            } else {
              PopupsStateService.updateCreatorPageState(true, creator.id)
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
          <IconButton aria-label="delete" color="primary" onClick={() => removeBlockedUser(creator.id)} size="large">
            <DeleteIcon />
          </IconButton>
        </div>
      }
    />
  ) : (
    <></>
  )
}

export default CreatorAsTitle
