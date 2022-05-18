import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { useGroupStyles } from './styles'
import SearchGroup from './SearchGroup'
import CreateGroup from './CreateGroup'
import GroupTable from './GroupTable'

const GroupConsole = () => {
  const classes = useGroupStyles()
  const [groupOpen, setGroupOpen] = React.useState(false)

  const openModalCreate = (open: boolean) => {
    setGroupOpen(open)
  }

  return (
    <React.Fragment>
      <div>
        <Grid container spacing={3} className={classes.marginBottom}>
          <Grid item xs={12} sm={9}>
            <SearchGroup />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              className={classes.createBtn}
              type="submit"
              variant="contained"
              onClick={() => openModalCreate(true)}
            >
              Create group
            </Button>
          </Grid>
        </Grid>
        <div className={classes.rootTable}>
          <GroupTable />
        </div>
      </div>
      <CreateGroup open={groupOpen} handleClose={openModalCreate} />
    </React.Fragment>
  )
}

export default GroupConsole
