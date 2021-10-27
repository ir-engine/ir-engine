import React from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import ViewMedia from './ViewMedia'
import { useARMediaStyles } from './styles'
import Grid from '@mui/material/Grid'
import { ArMediaService } from '@xrengine/client-core/src/social/state/ArMediaService'
import { ArMedia } from '@xrengine/common/src/interfaces/ArMedia'

interface Props {
  list?: Array<ArMedia>
}

const MediaTable = (props: Props) => {
  const { list } = props
  const classes = useARMediaStyles()
  const [viewModel, setViewModel] = React.useState(false)
  const [mediaAdmin, setMediaAdmin] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [mediaId, setMediaId] = React.useState('')
  const dispatch = useDispatch()
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
    ArMediaService.removeArMedia(mediaId)
    handleClose()
  }

  const rows = list.map((media) => {
    return (
      <Grid key={media.audioId} item xs={12} sm={6} md={3}>
        <Card className={classes.rootCard}>
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
      </Grid>
    )
  })

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        {rows}
      </Grid>
      {mediaAdmin && <ViewMedia openView={viewModel} mediaAdmin={mediaAdmin} closeViewModel={closeViewModel} />}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className={classes.alert} id="alert-dialog-title">
          {'Confirm to delete this media!'}
        </DialogTitle>
        <DialogContent className={classes.alert}>
          <DialogContentText className={classes.alert} id="alert-dialog-description">
            Deleting this media can not be recovered!
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.alert}>
          <Button onClick={handleClose} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={handleDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

export default MediaTable
