import React from 'react'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'

import { UserService } from '../../services/UserService'
import styles from '../Admin.module.scss'
import UserModel from './CreateUser'
import SearchUser from './SearchUser'
import UserTable from './UserTable'
import { useUserStyles } from './styles'

const Users = () => {
  const classes = useUserStyles()
  const [userModalOpen, setUserModalOpen] = React.useState(false)

  const openModalCreate = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }

    setUserModalOpen(open)
  }

  const closeViewModel = (open: boolean) => {
    setUserModalOpen(open)
  }

  const handleSkipGuests = (e: any) => {
    UserService.setSkipGuests(e.target.checked)
  }

  return (
    <div>
      <Grid container spacing={1} className={classes.marginBottom}>
        <Grid item md={8} xs={6}>
          <SearchUser />
        </Grid>
        <Grid item md={1} xs={1}>
          <FormControlLabel
            className={styles.checkbox}
            control={
              <Checkbox
                onChange={(e) => handleSkipGuests(e)}
                name="stereoscopic"
                className={styles.checkbox}
                color="primary"
              />
            }
            label="Hide guests"
          />
        </Grid>
        <Grid item md={3} xs={5}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            Create New User
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTable}>
        <UserTable />
      </div>

      <UserModel open={userModalOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
    </div>
  )
}

export default Users
