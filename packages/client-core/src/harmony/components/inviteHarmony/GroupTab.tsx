import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { useStyle, useStyles } from './style'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { useGroupState } from '../../../social/services/GroupService'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'

const GroupTab = () => {
  const classes = useStyles()
  const classex = useStyle()
  const [to, setTo] = useState('Select Group')

  const groupState = useGroupState()
  const invitableGroupState = groupState.invitableGroups
  const invitableGroups = invitableGroupState.groups.value

  useEffect(() => {
    if (groupState.invitableUpdateNeeded.value === true && groupState.getInvitableGroupsInProgress.value !== true) {
      GroupService.getInvitableGroups(0)
    }
  }, [groupState.invitableUpdateNeeded.value, groupState.getInvitableGroupsInProgress.value])

  const handleChangeTo = (event) => {
    setTo(event.target.value)
  }

  return (
    <Container style={{ marginTop: '4rem' }}>
      <Paper component="div" className={classes.createInput}>
        <FormControl fullWidth>
          <Select
            labelId="demo-controlled-open-select-label"
            id="demo-controlled-open-select"
            value={to}
            fullWidth
            displayEmpty
            style={{ padding: '6.3px' }}
            onChange={handleChangeTo}
            name="to"
            MenuProps={{ classes: { paper: classex.selectPaper } }}
          >
            <MenuItem value="Select Group" disabled style={{ background: 'transparent', color: '#f1f1f1' }}>
              <em>Select Group</em>
            </MenuItem>
            {invitableGroups?.map((el) => (
              <MenuItem value={el.name} key={el.id} style={{ background: 'transparent', color: '#f1f1f1' }}>
                {el.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      <DialogActions className={classes.mb10}>
        <Button variant="contained" className={classes.createBtn}>
          Send Invite
        </Button>
      </DialogActions>
    </Container>
  )
}

export default GroupTab
