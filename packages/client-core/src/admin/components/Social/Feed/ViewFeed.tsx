import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Chip from '@material-ui/core/Chip'
import BookmarkIcon from '@material-ui/icons/Bookmark'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import VisibilityIcon from '@material-ui/icons/Visibility'
import DialogActions from '@material-ui/core/DialogActions'
import Grid from '@material-ui/core/Grid'
import './PlayerStyles.css' // import css
import { Player } from 'video-react'
import { useStyle, useStyles } from './styles'
import EditFeed from './EditFeed'

interface Props {
  openModal: boolean
  viewFeed: any
  closeViewModel: any
}

const ViewFeed = (props: Props) => {
  const { openModal, viewFeed, closeViewModel } = props
  const [editMode, setEditMode] = React.useState(false)
  const classex = useStyle()
  const classes = useStyles()

  return (
    <Drawer anchor="right" open={openModal} onClose={() => closeViewModel(false)} classes={{ paper: classex.paper }}>
      {editMode ? <EditFeed adminFeed={viewFeed} closeEdit={() => setEditMode(false)}/>: (
        <React.Fragment>
          <Paper elevation={3} className={classes.paperHeight}>
        <Container maxWidth="sm">
          <div className={classes.center}>
            <Typography variant="h4" component="span" className={classes.typo}>
              {viewFeed.creatorName}
            </Typography>
          </div>
        </Container>
      </Paper>
      <Container maxWidth="sm">
        <div className={`${classes.space} ${classes.cardHolder}`} style={{ marginTop: '20px' }}>
          <div className={classes.wrapper}>
            <Typography variant="h6" component="span" className={classes.typo}>
              {viewFeed.title}
            </Typography>
            <div className={classes.views}>
              <span>{viewFeed.viewsCount} </span>
              <VisibilityIcon className={classes.span} style={{ marginLeft: '10px' }} />
            </div>
          </div>

          <div className={classes.Card}>
            <Grid container spacing={2} className={`${classes.Bottom} ${classes.containerMargin}`}>
              <Grid item xs={12} sm={6}>
                <Chip avatar={<BookmarkIcon className={classes.span} />} label="Book Mark" />
                <Chip
                  avatar={<WhatshotIcon className={classes.spanDange} />}
                  label="Fire"
                  className={classes.chipRoot}
                />
              </Grid>
            </Grid>

            <Player playsInline poster={viewFeed.previewUrl} src={viewFeed.videoUrl} />
            <Typography variant="body2" className={classes.span} component="p">
              {viewFeed.description}
            </Typography>
          </div>
        </div>
      </Container>
      <DialogActions className={classes.mt5}>
        <div>
          <Button className={classex.saveBtn} onClick={() => setEditMode(true)} >EDIT</Button>
          <Button onClick={() => closeViewModel(false)} className={classex.saveBtn}>
            CANCEL
          </Button>
        </div>
      </DialogActions>
        </React.Fragment>
      )}
    </Drawer>
  )
}

export default ViewFeed
