import React from 'react'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import ViewMedia from './ViewMedia'
import { useStyles } from './styles'

interface Props {
  list?: any
}

const MediaTable = (props: Props) => {
  const { list } = props
  const classes = useStyles()
  const [viewModel, setViewModel] = React.useState(false)
  const [mediaAdmin, setMediaAdmin] = React.useState('')

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
          <Button size="medium" className={`${classes.spanDange} ${classes.saveBtn}`}>
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
    </React.Fragment>
  )
}

export default MediaTable
