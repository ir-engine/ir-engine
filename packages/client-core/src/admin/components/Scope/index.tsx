import React from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { useStyles } from './styles'
import SearchScope from './SearchScope'
import CreateScope from './CreateScope'
import ScopeTable from './ScopeTable'

const ScopeConsole = () => {
  const classes = useStyles()
  const [scopeOpen, setScopeOpen] = React.useState(false)

  const openModalCreate = (open: boolean) => {
    setScopeOpen(open)
  }

  return (
    <React.Fragment>
      <div>
        <Grid container spacing={3} className={classes.marginBottom}>
          <Grid item xs={12} sm={9}>
            <SearchScope />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              className={classes.createBtn}
              type="submit"
              variant="contained"
              onClick={() => openModalCreate(true)}
            >
              Create scope
            </Button>
          </Grid>
        </Grid>
        <div>
          <ScopeTable />
        </div>
      </div>
      {scopeOpen && <CreateScope open={scopeOpen} handleClose={openModalCreate} />}
    </React.Fragment>
  )
}

export default ScopeConsole
