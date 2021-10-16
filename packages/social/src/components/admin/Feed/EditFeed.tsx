import React from 'react'
import Container from '@material-ui/core/Container'
import DialogTitle from '@material-ui/core/DialogTitle'
import Badge from '@material-ui/core/Badge'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'
import { Player } from 'video-react'
import './PlayerStyles.css'
import { useFeedStyles, useFeedStyle } from './styles'
import { validateFeedForm } from './validation'
import { Save } from '@material-ui/icons'
import { useDispatch } from '@xrengine/client-core/src/store'
import { bindActionCreators, Dispatch } from 'redux'
import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'

interface Props {
  adminFeed: any
  closeEdit: () => void
}

const EditFeed = (props: Props) => {
  const { closeEdit, adminFeed } = props
  const [state, setState] = React.useState({
    title: adminFeed.title,
    description: adminFeed.description,
    video: adminFeed.videoUrl,
    preview: adminFeed.previewUrl,
    formErrors: {
      title: '',
      description: '',
      video: '',
      preview: ''
    }
  })
  const dispatch = useDispatch()
  const classes = useFeedStyles()
  const classex = useFeedStyle()

  const handleChange = (e) => {
    const { name } = e.target
    const value = e.target.files ? e.target.files[0] : e.target.value
    let temp = state.formErrors
    switch (name) {
      case 'title':
        temp.title = value.length < 2 ? 'Title is required!' : ''
        break
      case 'description':
        temp.description = value.length < 2 ? 'Description is required!' : ''
        break
      case 'video':
        temp.video = value.length < 2 ? 'Video is required!' : ''
        break
      case 'preview':
        temp.preview = value.length < 2 ? 'Preview is required!' : ''
        break
      default:
        break
    }
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = (e: any) => {
    const { title, description, preview, video } = state
    let temp = state.formErrors

    if (!state.title) {
      temp.title = "Title can't be empty"
    }
    if (!state.description) {
      temp.description = 'Description is required'
    }
    if (!state.preview) {
      temp.preview = 'Preview is required'
    }
    if (!state.video) {
      temp.video = 'Video is required'
    }

    setState({ ...state, formErrors: temp })
    if (validateFeedForm(state, state.formErrors)) {
      FeedService.updateFeedAsAdmin(adminFeed.id, { preview, video, title, description })
      closeEdit()
    }
  }

  return (
    <Container maxWidth="sm" className={classes.space}>
      <DialogTitle id="form-dialog-title" className={classes.texAlign}>
        Update Feed
      </DialogTitle>
      <div className={classes.mgBtn}>
        <label>Title</label>
        <Paper component="div" className={state.formErrors.title.length > 0 ? classes.redBorder : classes.createInput}>
          <InputBase
            className={classes.input}
            name="title"
            placeholder="Enter title"
            style={{ color: '#fff' }}
            autoComplete="off"
            value={state.title}
            onChange={handleChange}
          />
        </Paper>
      </div>
      <div className={classes.mgBtn}>
        <label>Description</label>
        <Paper component="div" className={state.formErrors.title.length > 0 ? classes.redBorder : classes.createInput}>
          <InputBase
            className={classes.input}
            name="title"
            placeholder="Enter title"
            style={{ color: '#fff' }}
            autoComplete="off"
            value={state.description}
            onChange={handleChange}
          />
        </Paper>
      </div>
      {state.preview instanceof File || !state.preview ? (
        <div className={classes.mgBtn}>
          <span>Preview image</span>
          <Paper
            component="div"
            className={`${state.formErrors.preview.length > 0 ? classes.redBorder : classes.createInput}`}
          >
            <Button variant="contained" className={classes.btn} startIcon={<PhotoCamera />}>
              <input
                name="preview"
                onChange={handleChange}
                accept="image/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
              />
            </Button>
          </Paper>
        </div>
      ) : (
        <div>
          <Badge
            badgeContent={
              <IconButton
                onClick={() =>
                  setState({
                    ...state,
                    preview: ''
                  })
                }
                className={classes.spanDange}
              >
                <ClearIcon />
              </IconButton>
            }
          >
            <img className={classes.image} src={adminFeed.previewUrl} alt="Image" />
          </Badge>
        </div>
      )}

      {state.video instanceof File || !state.video ? (
        <div className={classes.mgBtn}>
          <span>Video</span>
          <Paper
            component="div"
            className={`${state.formErrors.video.length > 0 ? classes.redBorder : classes.createInput}`}
          >
            <Button variant="contained" className={classes.btn} startIcon={<CloudUploadIcon />}>
              <input
                name="video"
                onChange={handleChange}
                accept="video/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
              />
            </Button>
          </Paper>
        </div>
      ) : (
        <div className={classes.contSize}>
          <span className={classes.pos}>
            <Badge
              badgeContent={
                <IconButton
                  onClick={() =>
                    setState({
                      ...state,
                      video: ''
                    })
                  }
                  className={classes.spanDange}
                >
                  <ClearIcon style={{ fontWeight: 'bold' }} />
                </IconButton>
              }
            ></Badge>
          </span>
          <Player playsInline poster={adminFeed.previewUrl} src={adminFeed.videoUrl} />
        </div>
      )}

      <div className={classes.margin}>
        <Button onClick={handleSubmit} className={classex.saveBtn}>
          <span style={{ marginRight: '15px' }}>
            <Save />
          </span>{' '}
          Submit
        </Button>
        <Button
          onClick={() => {
            setState({
              ...state,
              preview: adminFeed.previewUrl,
              video: adminFeed.videoUrl
            })
            closeEdit()
          }}
          className={classex.saveBtn}
        >
          CANCEL
        </Button>
      </div>
    </Container>
  )
}

export default EditFeed
