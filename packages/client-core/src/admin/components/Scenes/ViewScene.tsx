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
            <Container maxWidth="lg">
              <div className={classesx.sceneRoot}>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <Paper className={classesx.sceneInfo}>
                      <label>Scene</label>
                      <Typography>Name:&nbsp;{adminScene.name}</Typography>
                      <Typography>Type:&nbsp;{adminScene.type}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <label>Entities</label>
                    {adminScene.entities.map((entity, index) => (
                      <Paper className={classesx.sceneInfo} key={entity.id}>
                        <Typography>{entity.name}</Typography>
                      </Paper>
                    ))}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <label>Entities</label>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper className={classesx.sceneInfo}>Info</Paper>
                  </Grid>
                </Grid>
              </div>
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
