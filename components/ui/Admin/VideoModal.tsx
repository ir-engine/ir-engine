import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Backdrop from '@material-ui/core/Backdrop'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Modal from '@material-ui/core/Modal'
import Select from '@material-ui/core/Select'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import {
  createVideo,
  updateVideo,
  deleteVideo
} from '../../../redux/admin/service'
import './admin.scss'
import EmptyLayout from '../Layout/EmptyLayout'
import { selectAdminState } from '../../../redux/admin/selector'
interface MProps {
  open: boolean
  handleClose: any,
  createVideo?: typeof createVideo,
  updateVideo?: typeof updateVideo,
  deleteVideo?: typeof deleteVideo,
  admin?: any,
  video?: any,
  mode: string
}

const mapStateToProps = (state: any) => {
  return {
    admin: selectAdminState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createVideo: bindActionCreators(createVideo, dispatch),
  updateVideo: bindActionCreators(updateVideo, dispatch),
  deleteVideo: bindActionCreators(deleteVideo, dispatch)
})
const VideoModal: React.FC<MProps> = (props: MProps) => {
  const state = {
    id: props.video?.id ? props.video.id : '',
    name: props.video?.name ? props.video.name : '',
    url: props.video?.url ? props.video.url : '',
    description: props.video?.description ? props.video.description : '',
    creator: props.video?.attribution?.creator ? props.video.attribution.creator : '',
    rating: props.video?.metadata?.rating ? props.video.metadata.rating : '',
    category1: props.video?.metadata?.categories ? props.video.metadata.categories[0] : '',
    category2: props.video?.metadata?.categories ? props.video.metadata.categories[1] : '',
    // eslint-disable-next-line camelcase
    thumbnail_url: props.video?.metadata?.thumbnail_url ? props.video.metadata.thumbnail_url : '',
    runtime: props.video?.metadata?.runtime ? props.video.metadata.runtime : '',
    stereoscopic: props.video?.metadata?.stereoscopic ? props.video.metadata.stereoscopic : false,
    subscriptionLevel: props.video?.subscriptionLevel ? props.video.subscriptionLevel : 'all',
    open: false
  }

  const handleInput = (e: any) => {
    state[e.target.name] = e.target.value
  }

  const handleCheck = (e: any) => {
    state[e.target.name] = e.target.checked
  }

  const createVideo = (e:any) => {
    e.preventDefault()

    const form = {
      id: state.id,
      name: state.name,
      description: state.description,
      url: state.url,
      creator: state.creator,
      metadata: {
        rating: state.rating,
        thumbnail_url: state.thumbnail_url,
        categories: [],
        runtime: state.runtime,
        stereoscopic: state.stereoscopic
      },
      subscriptionLevel: state.subscriptionLevel
    }

    if (state.category1.length > 0) {
      form.metadata.categories.push(state.category1)
    }
    if (state.category2.length > 0) {
      form.metadata.categories.push(state.category2)
    }

    if (props.mode === 'create') {
      delete form.id
      props.createVideo(form)
      props.handleClose()
    } else {
      props.updateVideo(form)
      props.handleClose()
    }
  }

  const deleteVideo = (id: string) => {
    props.deleteVideo(id)
    props.handleClose()
  }

  return (
    <EmptyLayout>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={'modal'}
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <div className={'paper-modal'}>
          <Button
            className={'close'}
            onClick={props.handleClose}
          >
            X
          </Button>
          <form className={'form'} noValidate onSubmit={(e) => createVideo(e)}>
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Title"
                  name="name"
                  autoComplete="title"
                  autoFocus
                  defaultValue={state.name}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="description"
                  label="Description"
                  id="description"
                  autoComplete="description"
                  defaultValue={state.description}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="url"
                  label="Video URL"
                  id="url"
                  autoComplete="url"
                  defaultValue={state.url}
                  disabled={props.mode === 'edit' && true}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="creator"
                  label="Video production credit"
                  id="creator"
                  autoComplete="creator"
                  defaultValue={state.creator}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="rating"
                  label="Rating"
                  id="rating"
                  autoComplete="rating"
                  defaultValue={state.rating}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="category1"
                  label="Category 1"
                  id="category1"
                  autoComplete="category1"
                  defaultValue={state.category1}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="category2"
                  label="Category 2"
                  id="category2"
                  autoComplete="category2"
                  defaultValue={state.category2}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="runtime"
                  label="Runtime (mm:ss)"
                  id="runtime"
                  autoComplete="runtime"
                  defaultValue={state.runtime}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="thumbnail_url"
                  label="Thumbnail URL"
                  id="thumbnail_url"
                  autoComplete="thumbnail_url"
                  defaultValue={state.thumbnail_url}
                  onChange={(e) => handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox
                    onChange={e => handleCheck(e)}
                    defaultChecked={state.stereoscopic}
                    name="stereoscopic"
                    color="primary"/>}
                  label="Stereoscopic"
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel id="subscriptionLevel">
                  Subscription Level
                </InputLabel>
                <Select
                  labelId="subscriptionLevel"
                  id="subscriptionLevel"
                  name="subscriptionLevel"
                  defaultValue={state.subscriptionLevel}
                  onChange={(e) => handleInput(e)}
                >
                  <MenuItem value={'all'}>All</MenuItem>
                  <MenuItem value={'paid'}>Paid</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={'submit'}
                >
                  {props.mode === 'create' && 'Upload Video'}
                  {props.mode === 'edit' && 'Update Video'}
                </Button>
                {props.mode === 'edit' &&
                  <Button
                    fullWidth
                    variant="contained"
                    className='submit delete'
                    onClick={() => deleteVideo(props.video.id)}
                  >
                    Delete Video
                  </Button>
                }
              </Grid>
            </Grid>
          </form>
        </div>
      </Modal>
    </EmptyLayout>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoModal)
