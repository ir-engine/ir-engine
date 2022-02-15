import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Search from '../../common/Search'
import { useStyles } from '../../styles/ui'
import AvatarTable from './AvatarTable'
import AvatarCreate from './AvatarCreate'

const Avatar = () => {
  const classes = useStyles()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <React.Fragment>
      <Grid container spacing={1} className={classes.marginBottom}>
        <Grid item md={8} xs={6}>
          <Search text="avatar" handleChange={handleChange} />
        </Grid>
        <Grid item md={4} xs={6}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={handleClickOpen}>
            Create Avatar
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTable}>
        <AvatarTable search={search} />
      </div>
      <AvatarCreate handleClose={handleClose} open={open} />
    </React.Fragment>
  )
}

export default Avatar
