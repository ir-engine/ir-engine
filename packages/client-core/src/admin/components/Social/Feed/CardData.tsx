import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import VisibilityIcon from '@material-ui/icons/Visibility'
import BookmarkIcon from '@material-ui/icons/Bookmark'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import Typography from '@material-ui/core/Typography'
import TagsIcon from '@material-ui/icons/LabelImportant'
import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import { useStyles } from './styles'

interface Props {
  feed: any
  openViewModal: any
  deleteFeed: any
}

const CardData = (props: Props) => {
  const { feed, openViewModal, deleteFeed } = props
  const classes = useStyles()
  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  const handleToggle = (e) => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }

  const handleCloseAndView = (event, feed) => {
    handleClose(event)
    openViewModal(true, feed)
  }

  const handleCloseAndDelete = (event, feedId) => {
    handleClose(event)
    deleteFeed(feedId)
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card className={classes.rootCard}>
        <CardActionArea onClick={(e) => handleCloseAndView(e, feed)}>
          {feed.featured === 1 && (
            <div className={classes.featuredBadge}>
              <Chip
                avatar={<TagsIcon className={classes.span} />}
                label="Featured"
                className={classes.feature}
                // onClick={handleClick}
              />
            </div>
          )}

          <CardMedia className={classes.feed} image={`${feed.previewUrl}`} title="Contemplative Reptile" />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2" className={classes.title}>
              {feed.title}
            </Typography>

            <Typography variant="body2" className={classes.span} component="p">
              {feed.description}
            </Typography>

            <div className={classes.chip}>
              {feed.bookmarks === 1 && (
                <Chip
                  avatar={<BookmarkIcon className={classes.span} />}
                  label="Book Mark"
                  // onClick={handleClick}
                />
              )}
              {feed.fires === 1 && (
                <Chip
                  avatar={<WhatshotIcon className={classes.spanDange} />}
                  label="Fire"
                  className={classes.chipRoot}
                  // onClick={handleClick}
                />
              )}
            </div>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Grid container>
            <Grid item xs={6}>
              <div className={classes.views}>
                <span>{feed.viewsCount} </span>
                <VisibilityIcon className={classes.span} style={{ marginLeft: '10px' }} />
              </div>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.cardPaper}>
                <IconButton
                  ref={anchorRef}
                  aria-controls={open ? 'menu-list-grow' : undefined}
                  aria-haspopup="true"
                  onClick={handleToggle}
                >
                  <MoreVertIcon className={classes.spanDange} />
                </IconButton>

                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                            <MenuItem onClick={(e) => handleCloseAndView(e, feed)}>View</MenuItem>
                            <MenuItem onClick={(e) => handleCloseAndDelete(e, feed.id)} className={classes.spanDange}>
                              Delete
                            </MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </Paper>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  )
}

export default CardData
