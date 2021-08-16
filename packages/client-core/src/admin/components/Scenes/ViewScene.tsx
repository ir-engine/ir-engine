import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import { Paper, Typography } from '@material-ui/core'
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
