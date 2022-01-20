import React from 'react'
import ViewDrawer from '../../common/ViewDrawer'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useStyles } from '../../styles/ui'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'

interface Props {
  openView: boolean
  closeViewModel: () => void
  partyAdmin: any
}

export default function ViewParty(props: Props) {
  const { openView, closeViewModel, partyAdmin } = props
  const classes = useStyles()
  console.log(partyAdmin)
  return (
    <ViewDrawer openView={openView} handleCloseDrawe={() => closeViewModel()}>
      <Paper elevation={0} className={classes.rootPaper}>
        {partyAdmin && (
          <Container maxWidth="sm">
            <div className={classes.locationTitle}>
              <Typography variant="h5" component="span">
                {partyAdmin?.location?.name}/{partyAdmin?.instance?.ipAddress}
              </Typography>
            </div>
          </Container>
        )}
      </Paper>
      <Typography
        variant="h4"
        component="h4"
        className={`${classes.mb20px} ${classes.spacing} ${classes.typoFont} ${classes.marginTp}`}
      >
        Instance
      </Typography>
      <Grid container spacing={2} className={classes.pdlarge}>
        <Grid item xs={6}>
          <Typography variant="h6" component="h6" className={classes.mb10}>
            Ip Address:
          </Typography>
          {/* <Typography variant="h6" component="h6" className={classes.mb10}>Updated At:</Typography> */}
          <Typography variant="h6" component="h6" className={classes.mb10}>
            User:
          </Typography>
          <Typography variant="h6" component="h6" className={classes.mb10}>
            Active:
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" component="h6" className={classes.mb10}>
            {partyAdmin?.instance?.ipAddress || <span className={classes.spanNone}>None</span>}
          </Typography>
          <Typography variant="h5" component="h5" className={classes.mb10}>
            {partyAdmin?.instance?.currentUsers}
          </Typography>
          <Typography variant="h5" component="h5" className={classes.mb10}>
            <span className={classes.spanNone}>{partyAdmin?.instance?.ended === 1 ? 'No' : 'Yes'}</span>
          </Typography>
        </Grid>
      </Grid>

      <Typography
        variant="h4"
        component="h4"
        className={`${classes.mb20px} ${classes.spacing} ${classes.typoFont} ${classes.marginTp}`}
      >
        Location
      </Typography>
      <Grid container spacing={2} className={classes.pdlarge}>
        <Grid item xs={6}>
          <Typography variant="h6" component="h6" className={classes.mb10}>
            Name:
          </Typography>
          {/* <Typography variant="h6" component="h6" className={classes.mb10}>Updated At:</Typography> */}
          <Typography variant="h6" component="h6" className={classes.mb10}>
            Maximum user:
          </Typography>
          <Typography variant="h6" component="h6" className={classes.mb10}>
            scene:
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" component="h6" className={classes.mb10}>
            {partyAdmin?.location?.name || <span className={classes.spanNone}>None</span>}
          </Typography>
          <Typography variant="h5" component="h5" className={classes.mb10}>
            {partyAdmin?.location?.maxUsersPerInstance}
          </Typography>
          <Typography variant="h5" component="h5" className={classes.mb10}>
            {partyAdmin?.location?.sceneId || <span className={classes.spanNone}>None</span>}
          </Typography>
        </Grid>
      </Grid>
      <DialogActions className={classes.mb10}>
        <div className={classes.marginTpM}>
          <Button
            className={classes.saveBtn}
            // onClick={() => {
            //   setEditMode(true)
            // }}
          >
            EDIT
          </Button>
          <Button onClick={() => closeViewModel()} className={classes.saveBtn}>
            CANCEL
          </Button>
        </div>
      </DialogActions>
    </ViewDrawer>
  )
}
