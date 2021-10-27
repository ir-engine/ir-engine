import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import SearchCreator from './SearchCreator'
import CreatorTable from './CreatorTable'
import CreateCreatorModel from './CreateCreator'
import { useCreatorStyles } from './styles'

const Creators = () => {
  const classes = useCreatorStyles()
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
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <SearchCreator />
        </Grid>
        <Grid item xs={3}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            Create New Creator
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTable}>
        <CreatorTable />
      </div>
      <CreateCreatorModel open={userModalOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
    </div>
  )
}

export default Creators
