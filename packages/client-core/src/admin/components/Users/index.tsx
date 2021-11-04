import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import UserModel from './CreateUser'
import UserTable from './UserTable'
import SearchUser from './SearchUser'
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

  return (
    <div>
      <Grid container spacing={1} className={classes.marginBottom}>
        <Grid item md={9} xs={7}>
          <SearchUser />
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
