import React, { useState } from 'react'
import Badge from '@mui/material/Badge'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import IconButton from '@mui/material/IconButton'
import ClearIcon from '@mui/icons-material/Clear'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import { useARMediaStyle, useARMediaStyles, useStylePlayer } from './styles'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import AudioPlayer from 'material-ui-audio-player'
import { useTranslation } from 'react-i18next'
import { Save } from '@mui/icons-material'
import { validateARMediaForm } from './validation'

import { useDispatch } from '@xrengine/client-core/src/store'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'
import Card from '@mui/material/Card'
import { ArMediaService } from '@xrengine/client-core/src/social/state/ArMediaService'

interface Props {
  mediaAdmin: any
  onCloseEdit: () => void
}

const EditArMedia = (props: Props) => {
  const classex = useARMediaStyle()
  const classes = useARMediaStyles()
  const { mediaAdmin, onCloseEdit } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [state, setState] = useState({
    title: mediaAdmin.title,
    type: mediaAdmin.type,
    audio: mediaAdmin.audioUrl,
    manifest: mediaAdmin.manifestUrl,
    dracosis: mediaAdmin.dracosisUrl,
    preview: mediaAdmin.previewUrl,
    formErrors: {
      title: '',
      type: '',
      audio: '',
      manifest: '',
      dracosis: '',
      preview: ''
    }
  })
  const handleChange = (e) => {
    const { name } = e.target
    const value = e.target.files ? e.target.files[0] : e.target.value
    let temp = state.formErrors
    switch (name) {
      case 'title':
        temp.title = value.length < 2 ? 'Title is required!' : ''
        break
      case 'type':
        temp.type = value.length < 2 ? 'Type is required!' : ''
        break
      case 'audio':
        temp.audio = value.length < 2 ? 'audio is required!' : ''
        break
      case 'manifest':
        temp.manifest = value.length < 2 ? 'Manifest is required!' : ''
        break
      case 'dracosis':
        temp.dracosis = value.length < 2 ? 'Dracosis is required!' : ''
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
    const { title, type, manifest, audio, dracosis, preview } = state
    let temp = state.formErrors
    if (!state.title) {
      temp.title = "Title can't be empty"
    }
    if (!state.type) {
      temp.type = 'Type is required'
    }
    if (!state.audio) {
      temp.audio = 'Audio is required'
    }
    if (!state.manifest) {
      temp.manifest = 'Manifest is required'
    }
    if (!state.dracosis) {
      temp.dracosis = 'Dracosis required'
    }
    if (!state.preview) {
      temp.preview = 'Preview is required'
    }
    setState({ ...state, formErrors: temp })
    if (validateARMediaForm(state, state.formErrors)) {
      ArMediaService.updateArMedia({ type, title }, { manifest, audio, dracosis, preview }, mediaAdmin.id)
      //   closeViewModel(false)
      //   setState({
      //     ...state,
      //     title: '',
      //     type: '',
      //     audio: '',
      //     manifest: '',
      //     dracosis: '',
      //     preview: ''
      //   })
      onCloseEdit()
    }
  }

  return (
    <React.Fragment>
      <Container maxWidth="sm" className={classes.space}>
        <DialogTitle id="form-dialog-title" className={classes.texAlign}>
          Update Media
        </DialogTitle>
        <div className={classes.mgBtn}>
          <label>Title</label>
          <Paper
            component="div"
            className={state.formErrors.title.length > 0 ? classes.redBorder : classes.createInput}
          >
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
          <label>Type</label>
          <Paper component="div" className={state.formErrors.type.length > 0 ? classes.redBorder : classes.createInput}>
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="type"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classex.selectPaper } }}
                value={state.type}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select type</em>
                </MenuItem>
                <MenuItem value="clip">{t('social:arMediaform.clip')}</MenuItem>
              </Select>
            </FormControl>
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
          <div className={`${classes.pos}`}>
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
                  size="large"
                >
                  <ClearIcon />
                </IconButton>
              }
            >
              <img className={classes.image} src={mediaAdmin.previewUrl} alt="Image" />
            </Badge>
          </div>
        )}

        {state.audio instanceof File || !state.audio ? (
          <div className={classes.mgBtn}>
            <span>Audio</span>
            <Paper
              component="div"
              className={`${state.formErrors.audio.length > 0 ? classes.redBorder : classes.createInput}`}
            >
              <Button variant="contained" className={classes.btn} startIcon={<CloudUploadIcon />}>
                <input
                  name="audio"
                  onChange={handleChange}
                  accept="audio/*"
                  className={classes.input}
                  id="contained-button-file"
                  multiple
                  type="file"
                />
              </Button>
            </Paper>
          </div>
        ) : (
          <Paper elevation={3} className={`${classes.space} ${classes.cardHolder} ${classes.pos} ${classes.mgBtn}`}>
            <Badge
              badgeContent={
                <IconButton
                  onClick={() =>
                    setState({
                      ...state,
                      audio: ''
                    })
                  }
                  className={classes.spanDange}
                  size="large"
                >
                  <ClearIcon style={{ fontWeight: 'bold' }} />
                </IconButton>
              }
            >
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
            </Badge>
          </Paper>
        )}
        <div className={classes.mgBtn}>
          <p>Dracosis</p>
          {state.dracosis instanceof File || !state.dracosis ? (
            <Paper
              component="div"
              className={`${state.formErrors.dracosis.length > 0 ? classes.redBorder : classes.createInput}`}
            >
              <Button variant="contained" className={classes.btn} startIcon={<CloudUploadIcon />}>
                <input
                  name="dracosis"
                  onChange={handleChange}
                  accept=".uvol"
                  className={classes.input}
                  id="contained-button-file"
                  multiple
                  type="file"
                />
              </Button>
            </Paper>
          ) : (
            <Badge
              badgeContent={
                <IconButton
                  onClick={() =>
                    setState({
                      ...state,
                      dracosis: ''
                    })
                  }
                  className={classes.spanDange}
                  size="large"
                >
                  <ClearIcon style={{ fontWeight: 'bold' }} />
                </IconButton>
              }
            >
              <Card className={classes.file}>
                <InsertDriveFile className={classes.placeHolderFile} />
              </Card>
            </Badge>
          )}
        </div>
        <div className={classes.mgBtn}>
          <p>Manifest </p>
          {state.manifest instanceof File || !state.manifest ? (
            <Paper
              component="div"
              className={`${state.formErrors.manifest.length > 0 ? classes.redBorder : classes.createInput}`}
            >
              <Button variant="contained" className={classes.btn} startIcon={<CloudUploadIcon />}>
                <input
                  name="manifest"
                  accept=".manifest"
                  className={classes.input}
                  id="contained-button-file"
                  multiple
                  type="file"
                  onChange={handleChange}
                />
              </Button>
            </Paper>
          ) : (
            <Badge
              badgeContent={
                <IconButton
                  onClick={() =>
                    setState({
                      ...state,
                      manifest: ''
                    })
                  }
                  className={classes.spanDange}
                  size="large"
                >
                  <ClearIcon style={{ fontWeight: 'bold' }} />
                </IconButton>
              }
            >
              <Card className={classes.file}>
                <InsertDriveFile className={classes.placeHolderFile} />
              </Card>
            </Badge>
          )}
        </div>

        <div>
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
                preview: mediaAdmin.previewUrl,
                audio: mediaAdmin.audioUrl
              })
              onCloseEdit()
            }}
            className={classex.saveBtn}
          >
            CANCEL
          </Button>
        </div>
      </Container>
    </React.Fragment>
  )
}

export default EditArMedia
