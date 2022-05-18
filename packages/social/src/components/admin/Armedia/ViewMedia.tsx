import React from 'react'
import Drawer from '@mui/material/Drawer'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@mui/material/Typography'
import DialogActions from '@mui/material/DialogActions'
import AudioPlayer from 'material-ui-audio-player'
import { useARMediaStyle, useARMediaStyles, useStylePlayer } from './styles'
import EditArMedia from './EditArmedia'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

interface Props {
  openView: boolean
  closeViewModel?: any
  mediaAdmin: any
}

const ViewMedia = (props: Props) => {
  const classex = useARMediaStyle()
  const classes = useARMediaStyles()
  const { openView, closeViewModel, mediaAdmin } = props
  const [editMode, setEditMode] = React.useState(false)

  return (
    <React.Fragment>
      <Drawer anchor="right" open={openView} onClose={() => closeViewModel(false)} classes={{ paper: classex.paper }}>
        {editMode ? (
          <EditArMedia mediaAdmin={mediaAdmin} onCloseEdit={() => setEditMode(false)} />
        ) : (
          <React.Fragment>
            <Paper elevation={3} className={classes.paperHeight}>
              <Container maxWidth="sm">
                <div className={classes.center}>
                  <Typography variant="h4" component="span" className={classes.typo}>
                    {mediaAdmin.title}
                  </Typography>
                </div>
              </Container>
            </Paper>
            <Container maxWidth="sm">
              <div className={`${classes.space} ${classes.cardHolder}`} style={{ marginTop: '20px' }}>
                <Typography variant="h6" component="span" className={classes.typo}>
                  {`${mediaAdmin.type}`}
                </Typography>

                <div className={classes.Card}>
                  <img className={classes.image} src={`${mediaAdmin.previewUrl}`} />
                </div>

                <AudioPlayer
                  elevation={1}
                  useStyles={useStylePlayer}
                  spacing={1}
                  width="100%"
                  download={false}
                  autoplay={false}
                  order="standart"
                  loop={false}
                  src={`${mediaAdmin.audioUrl}`}
                />

                <div className={classes.Card}>
                  <Grid container spacing={2} className={`${classes.marginBottom} ${classes.containerFile}`}>
                    {mediaAdmin.dracosisUrl && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" component="p" className={classes.typo}>
                          Dracosis
                        </Typography>
                        <Card className={classes.file}>
                          <InsertDriveFile className={classes.placeHolderFile} />
                        </Card>
                      </Grid>
                    )}
                    {mediaAdmin.manifestUrl && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" component="p" className={classes.typo}>
                          Manifest
                        </Typography>
                        <Card className={classes.file}>
                          <InsertDriveFile className={classes.placeHolderFile} />
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </div>
              </div>

              <DialogActions className={classes.mt5}>
                <div>
                  <Button
                    onClick={() => {
                      setEditMode(true)
                    }}
                    className={classex.saveBtn}
                  >
                    EDIT
                  </Button>
                  <Button onClick={() => closeViewModel(false)} className={classex.saveBtn}>
                    CANCEL
                  </Button>
                </div>
              </DialogActions>
            </Container>
          </React.Fragment>
        )}
      </Drawer>
    </React.Fragment>
  )
}

export default ViewMedia
