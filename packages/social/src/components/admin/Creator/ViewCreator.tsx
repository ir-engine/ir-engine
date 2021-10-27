import React from 'react'
import { Drawer, Paper, Typography } from '@mui/material'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import { DialogActions } from '@mui/material'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import { useCreatorStyle, useCreatorStyles } from './styles'
import EditCreator from './EditCreator'

interface Props {
  adminCreator: any
  viewModal: boolean
  closeViewModal: any
}

const ViewCreator = (props: Props) => {
  const { adminCreator, viewModal, closeViewModal } = props
  const [editMode, setEditMode] = React.useState(false)
  const classes = useCreatorStyles()
  const classesx = useCreatorStyle()

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classesx.paper }} anchor="right" open={viewModal} onClose={() => closeViewModal(false)}>
        {editMode ? (
          <EditCreator adminCreator={adminCreator} closeEditModal={() => setEditMode(false)} />
        ) : (
          <React.Fragment>
            <Paper elevation={3} className={classes.paperHeight}>
              <Container maxWidth="sm">
                <div className={classes.center}>
                  <Typography variant="h4" component="span" className={classes.typo}>
                    {adminCreator.name}
                  </Typography>
                </div>
              </Container>
            </Paper>
            <Container maxWidth="sm" className={classes.marginTop}>
              <Typography variant="h4" component="h4" className={classes.mb40px}>
                Creator Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Email:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Username:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Link:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Avatar:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Description:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminCreator?.email || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminCreator?.username || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminCreator?.link || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminCreator?.avatarId || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {adminCreator.bio || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                </Grid>
              </Grid>
              <DialogActions className={classes.marginTp}>
                <Button onClick={() => setEditMode(true)} className={classesx.saveBtn}>
                  Edit
                </Button>
                <Button onClick={() => closeViewModal(false)} className={classesx.saveBtn}>
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

export default ViewCreator
