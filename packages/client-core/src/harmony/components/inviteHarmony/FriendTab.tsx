import React, { useState } from 'react'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import Container from '@material-ui/core/Container'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Email, AccountCircle, PhoneIphone, SupervisedUserCircle } from '@mui/icons-material'
import Paper from '@material-ui/core/Paper'
import { useStyle, useStyles } from './style'

const FriendTab = () => {
  const classes = useStyles()
  const classex = useStyle()

  const [via, setVia] = useState('Send Via')
  const [to, setTo] = useState('Select Friend')

  const handleChangeVia = (event) => {
    setVia(event.target.value)
  }
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
            value={via}
            classes={{ select: classes.select }}
            name="via"
            onChange={handleChangeVia}
            inputProps={{
              id: 'open-select'
            }}
            MenuProps={{ classes: { paper: classex.selectPaper } }}
          >
            <MenuItem value="Send Via" disabled style={{ background: 'transparent', color: '#f1f1f1' }}>
              <em>Send Via </em>
            </MenuItem>
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
              style={{ padding: '6.3px' }}
              name="to"
              onChange={handleChangeTo}
              inputProps={{
                id: 'open-select'
              }}
              MenuProps={{ classes: { paper: classex.selectPaper } }}
            >
              <MenuItem value="Select Friend" disabled style={{ background: 'transparent', color: '#f1f1f1' }}>
                <em>Select Friend</em>
              </MenuItem>
              {['Kim', 'Kevin', 'Smith', 'Nelly'].map((el) => (
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
    </Container>
  )
}

export default FriendTab
