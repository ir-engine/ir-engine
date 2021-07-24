import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { removeArMedia } from '../../../socialmedia/reducers/arMedia/service'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'
import ViewMedia from './ViewMedia'
import { useStyles } from './styles'

interface Props {
  list?: any
  removeArMedia?: typeof removeArMedia
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  removeArMedia: bindActionCreators(removeArMedia, dispatch)
})

const MediaTable = (props: Props) => {
  const { list, removeArMedia } = props
  const classes = useStyles()
  const [viewModel, setViewModel] = React.useState(false)
  const [mediaAdmin, setMediaAdmin] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [mediaId, setMediaId] = React.useState('')

  const handleClickOpen = (id: string) => {
    setMediaId(id)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const openViewModel = (open: boolean, media: any) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setMediaAdmin(media)
    setViewModel(open)
  }

  const closeViewModel = (open) => {
    setViewModel(open)
  }

  const handleDelete = () => {
    removeArMedia(mediaId)
    handleClose()
  }

  const rows = list.map((media) => {
    return (
      <Card key={media.audioId} className={classes.rootCard}>
        <CardActionArea>
          <CardMedia className={classes.media} image={`${media.previewUrl}`} title="Contemplative Reptile" />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2" className={classes.typo}>
              {media.title}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button
            size="medium"
            style={{ color: '#f1f1f1' }}
            className={classes.saveBtn}
            onClick={openViewModel(true, media)}
          >
            View
          </Button>
          <Button
            onClick={() => handleClickOpen(media.id.toString())}
            size="medium"
            className={`${classes.spanDange} ${classes.saveBtn}`}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    )
  })

  return (
    <React.Fragment>
      {rows}
      {mediaAdmin && <ViewMedia openView={viewModel} mediaAdmin={mediaAdmin} closeViewModel={closeViewModel} />}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm to delete this media!'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Deleting this media can not be recovered!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

export default connect(null, mapDispatchToProps)(MediaTable)
