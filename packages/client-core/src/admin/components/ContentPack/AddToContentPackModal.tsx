import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAppState } from '../../../common/reducers/app/selector'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectContentPackState } from '../../reducers/contentPack/selector'
import styles from './ContentPack.module.scss'
import {
  addAvatarsToContentPack,
  addScenesToContentPack,
  createContentPack,
  fetchContentPacks
} from '../../reducers/contentPack/service'
import { Add, Edit } from '@material-ui/icons'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Modal from '@material-ui/core/Modal'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import CircularProgress from '@material-ui/core/CircularProgress'

interface Props {
  open: boolean
  handleClose: any
  scenes?: any
  avatars?: any
  adminState?: any
  contentPackState?: any
  addScenesToContentPack?: any
  addAvatarsToContentPack?: any
  createContentPack?: any
  fetchContentPacks?: any
}

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    contentPackState: selectContentPackState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  addScenesToContentPack: bindActionCreators(addScenesToContentPack, dispatch),
  addAvatarsToContentPack: bindActionCreators(addAvatarsToContentPack, dispatch),
  createContentPack: bindActionCreators(createContentPack, dispatch),
  fetchContentPacks: bindActionCreators(fetchContentPacks, dispatch)
})

const AddToContentPackModal = (props: Props): any => {
  const {
    addAvatarsToContentPack,
    addScenesToContentPack,
    createContentPack,
    open,
    handleClose,
    avatars,
    scenes,
    contentPackState,
    fetchContentPacks
  } = props

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [createOrPatch, setCreateOrPatch] = useState('patch')
  const [contentPackName, setContentPackName] = useState('')
  const [newContentPackName, setNewContentPackName] = useState('')
  const contentPacks = contentPackState.get('contentPacks')

  const showError = (err: string) => {
    setError(err)
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  const handleCreateOrPatch = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    setCreateOrPatch(newValue)
  }

  const addCurrentScenesToContentPack = async () => {
    try {
      setProcessing(true)
      await addScenesToContentPack({
        scenes: scenes,
        contentPack: contentPackName
      })
      setProcessing(false)
      window.location.href = '/admin/content-packs'
      closeModal()
    } catch (err) {
      setProcessing(false)
      showError(err.message)
    }
  }

  const addCurrentAvatarsToContentPack = async () => {
    try {
      setProcessing(true)
      await addAvatarsToContentPack({
        avatars: avatars,
        contentPack: contentPackName
      })
      setProcessing(false)
      window.location.href = '/admin/content-packs'
      closeModal()
    } catch (err) {
      setProcessing(false)
      showError(err.message)
    }
  }

  const createNewContentPack = async () => {
    try {
      setProcessing(true)
      if (scenes != null)
        await createContentPack({
          scenes: scenes,
          contentPack: newContentPackName
        })
      else if (avatars != null)
        await createContentPack({
          avatars: avatars,
          contentPack: newContentPackName
        })
      setProcessing(false)
      window.location.href = '/admin/content-packs'
      closeModal()
    } catch (err) {
      setProcessing(false)
      showError(err.message)
    }
  }

  const closeModal = () => {
    setContentPackName('')
    setNewContentPackName('')
    handleClose()
  }

  useEffect(() => {
    if (contentPackState.get('updateNeeded') === true) {
      fetchContentPacks()
    }
  }, [contentPackState])

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={closeModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            <div className={styles['modal-header']}>
              <div />
              {scenes && <div className={styles['title']}>Adding {scenes.length} Scenes</div>}
              {avatars && <div className={styles['title']}>Adding {avatars.length} Avatars</div>}
              <IconButton aria-label="close" className={styles.closeButton} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>
            <ToggleButtonGroup
              value={createOrPatch}
              exclusive
              onChange={handleCreateOrPatch}
              aria-label="Create or Edit Content Pack"
            >
              <ToggleButton value="patch" aria-label="Add to existing content pack">
                <Edit />
                Add to existing content pack
              </ToggleButton>
              <ToggleButton value="create" aria-label="Create new content pack">
                <Add />
                Create New Content Pack
              </ToggleButton>
            </ToggleButtonGroup>
            {processing === false && createOrPatch === 'patch' && (
              <div>
                <FormControl>
                  <InputLabel id="contentPackSelect">Content Pack</InputLabel>
                  <Select
                    className={styles['pack-select']}
                    labelId="Content Pack"
                    id="contentPackSelect"
                    value={contentPackName}
                    onChange={(e) => setContentPackName(e.target.value as string)}
                  >
                    {contentPacks.map((contentPack) => (
                      <MenuItem key={contentPack.name} value={contentPack.name}>
                        {contentPack.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={scenes != null ? addCurrentScenesToContentPack : addCurrentAvatarsToContentPack}
                  >
                    Update Content Pack
                  </Button>
                </FormControl>
              </div>
            )}
            {processing === false && createOrPatch === 'create' && (
              <div>
                <FormControl>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="newContentPack"
                    label="Content Pack Name"
                    placeholder="content_pack1"
                    name="name"
                    required
                    value={newContentPackName}
                    onChange={(e) => setNewContentPackName(e.target.value)}
                  />
                  <Button type="submit" variant="contained" color="primary" onClick={createNewContentPack}>
                    Create Content Pack
                  </Button>
                </FormControl>
              </div>
            )}
            {processing === true && (
              <div className={styles.processing}>
                <CircularProgress color="primary" />
                <div className={styles.text}>Processing</div>
              </div>
            )}
            {error && error.length > 0 && <h2 className={styles['error-message']}>{error}</h2>}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AddToContentPackModal)
