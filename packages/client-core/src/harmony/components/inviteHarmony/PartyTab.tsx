import React, { useState } from 'react'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import InputBase from '@mui/material/InputBase'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import Container from '@mui/material/Container'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { Email, AccountCircle, PhoneIphone, SupervisedUserCircle } from '@mui/icons-material'
import Paper from '@mui/material/Paper'
import { useStyle, useStyles } from './style'
import { useAuthState } from '../../../user/services/AuthService'
import Alert from '@mui/material/Alert'

const PartyTab = () => {
  const classes = useStyles()
  const classex = useStyle()

  const [via, setVia] = useState('Email')
  const [to, setTo] = useState('Smith')
  const selfUser = useAuthState().user

  console.log(selfUser.value)

  const handleChangeVia = (event) => {
    setVia(event.target.value)
  }
  const handleChangeTo = (event) => {
    setTo(event.target.value)
  }

  return (
    <Container style={{ marginTop: '4rem' }}>
      {!selfUser.value.partyId ? (
        <Alert severity="warning">You are not in any party </Alert>
      ) : (
        <div>
          <Paper component="div" className={classes.createInput}>
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                value={via}
                classes={{ select: classes.select }}
                name="via"
                onChange={handleChangeVia}
                inputProps={{
                  id: 'open-select'
                }}
                MenuProps={{ classes: { paper: classex.selectPaper } }}
              >
                {['Phone', 'Email', 'Invite Code', 'Friend'].map((el) => (
                  <MenuItem value={el} key={el} style={{ background: 'transparent', color: '#f1f1f1' }}>
                    <ListItemIcon>
                      {el === 'Phone' ? <PhoneIphone className={classes.whiteIcon} /> : ''}
                      {el === 'Email' ? <Email className={classes.whiteIcon} /> : ''}
                      {el === 'Invite Code' ? <AccountCircle className={classes.whiteIcon} /> : ''}
                      {el === 'Friend' ? <SupervisedUserCircle className={classes.whiteIcon} /> : ''}
                    </ListItemIcon>
                    <ListItemText>{el}</ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          {via === 'Friend' ? (
            <Paper component="div" className={classes.createInput}>
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  value={to}
                  classes={{ select: classes.select }}
                  name="to"
                  onChange={handleChangeTo}
                  inputProps={{
                    id: 'open-select'
                  }}
                  MenuProps={{ classes: { paper: classex.selectPaper } }}
                >
                  <MenuItem value="" disabled style={{ background: 'transparent', color: '#f1f1f1' }}>
                    <em>Select Friend</em>
                  </MenuItem>
                  {['Kim', 'Kevin', 'Smith', 'Gary'].map((el) => (
                    <MenuItem value={el} key={el} style={{ background: 'transparent', color: '#f1f1f1' }}>
                      {el}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          ) : (
            <Paper component="div" className={classes.input}>
              <InputBase
                name="name"
                placeholder={`Recipient's ${via.toLowerCase()}`}
                style={{ color: '#fff' }}
                autoComplete="off"
              />
            </Paper>
          )}
          <DialogActions className={classes.mb10}>
            <Button variant="contained" className={classes.createBtn}>
              Send Invite
            </Button>
          </DialogActions>
        </div>
      )}
    </Container>
  )
}

export default PartyTab
