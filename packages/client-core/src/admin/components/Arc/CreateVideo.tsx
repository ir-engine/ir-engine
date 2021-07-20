import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import DialogActions from '@material-ui/core/DialogActions'
import Container from '@material-ui/core/Container'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useStyles, useStyle } from './styles'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import PhotoCamera from '@material-ui/icons/PhotoCamera'

interface Props {
  open: boolean
  handleClose: any
  closeViewModel: any
}

const CreateVideo = (props: Props) => {
  const { open, handleClose, closeViewModel } = props
  const classes = useStyles()
  const classesx = useStyle()
  return (
    <React.Fragment>
      <Drawer classes={{ paper: classesx.paper }} anchor="right" open={open} onClose={handleClose(false)}>
        <Container maxWidth="sm" className={classes.space}>
          <DialogTitle id="form-dialog-title" className={classes.texAlign}>
            Create New Media
          </DialogTitle>
          <label>Title</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase
              className={classes.input}
              name="name"
              placeholder="Enter title"
              style={{ color: '#fff' }}
              autoComplete="off"
            />
          </Paper>
          <label>Type</label>
          <Paper component="div" className={classes.createInput}>
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="mediaType"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classesx.selectPaper } }}
              >
                <MenuItem value="0" disabled>
                  <em>Select type</em>
                </MenuItem>
                <MenuItem value="1" key="1">
                  clip
                </MenuItem>
                <MenuItem value="2" key="2">
                  video
                </MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <div className={classes.uploadContainer}>
            <div className={classes.uploadItem}>
              <div className={classes.upload}>
                <span>Video</span>
                <Paper component="div" className={`${classes.createInput} ${classes.spaceLen}`}>
                  <Button variant="contained" className={classes.button} startIcon={<CloudUploadIcon />}>
                    <input accept="video/*" className={classes.input} id="contained-button-file" multiple type="file" />
                  </Button>
                </Paper>
              </div>
              <div className={classes.upload}>
                <span>Dracosis</span>
                <Paper component="div" className={`${classes.createInput} ${classes.spaceLen}`}>
                  <Button variant="contained" className={classes.button} startIcon={<CloudUploadIcon />}>
                    <input accept=".uvol" className={classes.input} id="contained-button-file" multiple type="file" />
                  </Button>
                </Paper>
              </div>
            </div>
            <div className={classes.uploadItem}>
              <div className={classes.upload}>
                <span>Manifest </span>
                <Paper component="div" className={`${classes.createInput} ${classes.spaceLen}`}>
                  <Button variant="contained" className={classes.button} startIcon={<CloudUploadIcon />}>
                    <input
                      accept=".manifest"
                      className={classes.input}
                      id="contained-button-file"
                      multiple
                      type="file"
                    />
                  </Button>
                </Paper>
              </div>
              <div className={classes.upload}>
                <span>Preview image</span>
                <Paper component="div" className={`${classes.createInput} ${classes.spaceLen}`}>
                  <Button variant="contained" className={classes.button} startIcon={<PhotoCamera />}>
                    <input accept="image/*" className={classes.input} id="contained-button-file" multiple type="file" />
                  </Button>
                </Paper>
              </div>
            </div>
          </div>
          <DialogActions>
            <Button className={classesx.saveBtn}>Submit</Button>
            <Button onClick={handleClose(false)} className={classesx.saveBtn}>
              Cancel
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default CreateVideo
