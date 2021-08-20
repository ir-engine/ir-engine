import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import { Paper, Typography, Grid } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import { DialogActions } from '@material-ui/core'
import { useStyle, useStyles } from './styles'

interface Props {
  adminScene: any
  viewModal: boolean
  closeViewModal: any
}

const ViewScene = (props: Props) => {
  const { adminScene, viewModal, closeViewModal } = props
  console.log('adminScene', adminScene)

  const classes = useStyles()
  const classesx = useStyle()

  const [editMode, setEditMode] = React.useState(false)

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classesx.paper }} anchor="right" open={viewModal} onClose={() => closeViewModal(false)}>
        {editMode ? (
          ''
        ) : (
          <React.Fragment>
            <Paper elevation={3} className={classes.paperHeight}>
              <Container maxWidth="sm">
                <div className={classes.center}>
                  <Typography variant="h4" component="span" className={classes.typo}>
                    {adminScene.name}
                  </Typography>
                </div>
              </Container>
            </Paper>
            <Container maxWidth="lg" className={classes.marginTop}>
              <Typography variant="h4" component="h4" className={classes.mb40px}>
                Scene Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Type:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    SID:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Entities:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    version:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Description:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminScene?.type || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminScene?.sid || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminScene?.entities.length || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminScene?.version || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminScene?.description || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                </Grid>
              </Grid>
            </Container>

            <DialogActions className={classes.marginTp}>
              <Button onClick={() => setEditMode(true)} className={classesx.saveBtn}>
                Edit
              </Button>
              <Button onClick={() => closeViewModal(false)} className={classesx.saveBtn}>
                Cancel
              </Button>
            </DialogActions>
          </React.Fragment>
        )}
      </Drawer>
    </React.Fragment>
  )
}

export default ViewScene
