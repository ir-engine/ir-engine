import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { DialogActions } from '@material-ui/core'
import { useStyle, useStyles } from './styles'
import EditScope from './EditScope'

interface Props {
  adminScope: any
  viewModal: boolean
  closeViewModal: any
}

const ViewScope = (props: Props) => {
  const { adminScope, viewModal, closeViewModal } = props

  const [editMode, setEditMode] = React.useState(false)
  const classes = useStyles()
  const classex = useStyle()

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paper }} anchor="right" open={viewModal} onClose={() => closeViewModal(false)}>
        {editMode ? (
          <EditScope scopeAdmin={adminScope} onCloseEdit={() => setEditMode(false)} />
        ) : (
          <React.Fragment>
            <Paper elevation={3} className={classes.paperHeight}>
              <Container maxWidth="sm">
                <div className={classes.center}>
                  <Typography variant="h4" component="span" className={classes.typo}>
                    {adminScope.scopeName}
                  </Typography>
                </div>
              </Container>
            </Paper>
            <Container>
              <div className={classes.flex}>
                <Container maxWidth="sm" className={classes.margin}>
                  <Typography variant="h4" component="h4" className={classes.mb40px}>
                    User Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Name:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Invite Code:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        User Role:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Avatar:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.user?.name || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.user?.inviteCode || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.user?.userRole || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.user?.avatarId || <span className={classes.spanNone}>None</span>}
                      </Typography>
                    </Grid>
                  </Grid>
                </Container>
                <Container maxWidth="sm" className={classes.margin}>
                  <Typography variant="h4" component="h4" className={classes.mb40px}>
                    Group Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Name:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Description:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.group?.name || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.group?.description || <span className={classes.spanNone}>None</span>}
                      </Typography>
                    </Grid>
                  </Grid>
                </Container>
              </div>
              <Container className={classes.margin}>
                <Typography variant="h4" component="h4" className={classes.mb40px}>
                  Scope Type Information
                </Typography>
                <div className={classes.flex}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Scene:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Location:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Editor:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.scopeType?.scene || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.scopeType?.location || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.scopeType?.editor || <span className={classes.spanNone}>None</span>}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Bot:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Global Avatar:
                      </Typography>
                      <Typography variant="h5" component="h5" className={classes.mb10}>
                        Static Resource:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.scopeType?.bot || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.scopeType?.globalAvatars || <span className={classes.spanNone}>None</span>}
                      </Typography>
                      <Typography variant="h6" component="h6" className={classes.mb10}>
                        {adminScope?.scopeType?.static_resource || <span className={classes.spanNone}>None</span>}
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
              </Container>
              <DialogActions className={classes.margin}>
                <Button onClick={() => setEditMode(true)} className={classes.saveBtn}>
                  Edit
                </Button>
                <Button onClick={() => closeViewModal(false)} className={classes.saveBtn}>
                  Cancel
                </Button>
              </DialogActions>
            </Container>
          </React.Fragment>
        )}
      </Drawer>
    </React.Fragment>
  )
}

export default ViewScope
