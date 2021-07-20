import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import DialogActions from '@material-ui/core/DialogActions'
import { Edit, Save } from '@material-ui/icons'
import { useStyle, useStyles } from './styles'

interface Props {
  openView: boolean
  closeViewModel?: any
  mediaAdmin: any
}

const ViewMedia = (props: Props) => {
  const classex = useStyle()
  const { openView, closeViewModel, mediaAdmin } = props
  const [editMode, setEditMode] = React.useState(false)

  console.log(mediaAdmin)
  const classx = useStyle()
  const classes = useStyles()

  return (
    <React.Fragment>
      <Drawer anchor="right" open={openView} onClose={() => closeViewModel(false)} classes={{ paper: classex.paper }}>
        {mediaAdmin && (
          <React.Fragment>
            <Paper elevation={3} className={classes.paperHeight}>
              <Container maxWidth="sm">
                <div className={classes.center}>
                  <Typography variant="h4" component="span" className={classes.typo}>
                    {mediaAdmin.title}
                  </Typography>
                </div>
                <div className={classes.position}>
                  <Typography variant="h6" component="span" className={classes.typo}>
                    {`${mediaAdmin.type}`}
                  </Typography>
                </div>
              </Container>
            </Paper>
            <Paper elevation={3} className={classes.space}>
              <div className={classes.cardHolder}>
                <div className={classes.Card}>
                  <img src={`${mediaAdmin.audioUrl}`} />
                </div>
                <div className={classes.Card}>
                  <img src={`${mediaAdmin.dracosisUrl}`} />
                </div>
              </div>
              <div className={classes.cardHolder}>
                <div className={classes.Card}>
                  <img src={`${mediaAdmin.manifestUrl}`} />
                </div>
                <div className={classes.Card}>
                  <img src={`${mediaAdmin.previewUrl}`} />
                </div>
              </div>
            </Paper>
            <DialogActions className={classes.mt10}>
              {editMode ? (
                <div>
                  <Button className={classx.saveBtn}>
                    <span style={{ marginRight: '15px' }}>
                      <Save />
                    </span>{' '}
                    Submit
                  </Button>
                  <Button className={classx.saveBtn}>CANCEL</Button>
                </div>
              ) : (
                <div>
                  <Button className={classx.saveBtn}>EDIT</Button>
                  <Button onClick={() => closeViewModel(false)} className={classx.saveBtn}>
                    CANCEL
                  </Button>
                </div>
              )}
            </DialogActions>
          </React.Fragment>
        )}
      </Drawer>
    </React.Fragment>
  )
}

export default ViewMedia
