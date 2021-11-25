import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '@xrengine/client-core/src/store'

import Drawer from '@mui/material/Drawer'
import Button from '@material-ui/core/Button'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DialogActions from '@mui/material/DialogActions'
import Container from '@mui/material/Container'
import DialogTitle from '@mui/material/DialogTitle'
import { useARMediaStyles, useARMediaStyle } from './styles'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import { validateARMediaForm } from './validation'
import { ArMediaService } from '@xrengine/client-core/src/social/services/ArMediaService'

interface Props {
  open: boolean
  handleClose: any
  closeViewModel: any
}

const CreateVideo = (props: Props) => {
  const { t } = useTranslation()
  const { open, handleClose, closeViewModel } = props
  const classes = useARMediaStyles()
  const classesx = useARMediaStyle()
  const dispatch = useDispatch()
  const [state, setState] = useState({
    title: '',
    type: '',
    audio: '',
    manifest: '',
    dracosis: '',
    preview: '',
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
    e.preventDefault()
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
      ArMediaService.createArMedia({ type, title }, { manifest, audio, dracosis, preview })
      closeViewModel(false)
      setState({
        ...state,
        title: '',
        type: '',
        audio: '',
        manifest: '',
        dracosis: '',
        preview: ''
      })
    }
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classesx.paper }} anchor="right" open={open} onClose={handleClose(false)}>
        <Container maxWidth="sm" className={classes.space}>
          <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle id="form-dialog-title" className={classes.texAlign}>
              Create New Media
            </DialogTitle>

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
            <label>Type</label>
            <Paper
              component="div"
              className={state.formErrors.type.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="type"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classesx.selectPaper } }}
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

            <span>Dracosis</span>
            <Paper
              component="div"
              className={`${state.formErrors.dracosis.length > 0 ? classes.redBorder : classes.createInput}`}
            >
              <Button variant="contained" className={classes.btn} startIcon={<CloudUploadIcon />}>
                <input
                  name="dracosis"
                  onChange={handleChange}
                  accept=".uvol,.drcs"
                  className={classes.input}
                  id="contained-button-file"
                  multiple
                  type="file"
                />
              </Button>
            </Paper>

            <span>Manifest </span>
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

            <DialogActions className={classes.marginTp}>
              <Button type="submit" className={classesx.saveBtn}>
                Submit
              </Button>
              <Button onClick={handleClose(false)} className={classesx.saveBtn}>
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default CreateVideo
