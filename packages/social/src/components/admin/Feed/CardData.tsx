import React from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import VisibilityIcon from '@mui/icons-material/Visibility'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import Typography from '@mui/material/Typography'
import TagsIcon from '@mui/icons-material/LabelImportant'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import { useFeedStyles } from './styles'

interface Props {
  feed: any
  openViewModal: any
  deleteFeed: any
}

const CardData = (props: Props) => {
  const { feed, openViewModal, deleteFeed } = props
  const classes = useFeedStyles()
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
                  size="large"
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
