import React, { useState } from 'react'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { ArrowBack, Help, SystemUpdateAlt } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../../styles/ui'
import InputText from '../../common/InputText'
import { AVATAR_FILE_ALLOWED_EXTENSIONS } from '@xrengine/common/src/constants/AvatarConstants'
import Drawer from '@mui/material/Drawer'
import Container from '@mui/material/Container'
import { styled } from '@mui/material/styles'
import { AvatarService } from '../../services/AvatarService'

const Input = styled('input')({
  display: 'none'
})

const AvatarCreate = ({ handleClose, open }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectUse, setSelectUse] = useState(false)
  const [description, setDescription] = useState('')

  const handleAvatarNameChange = (e) => {
    e.preventDefault()
    setAvatarName(e.target.value)
  }

  const handleAvatarUrlChange = (event) => {
    event.preventDefault()
    setAvatarUrl(event.target.value)
  }

  const uploadByUrls = async () => {
    const data = {
      name: avatarName,
      description: description,
      url: avatarUrl,
      staticResourceType: 'avatar'
    }
    await AvatarService.createAdminAvatar(data)
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paperDrawer }} anchor="right" open={open} onClose={handleClose}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <DialogTitle>
            <IconButton onClick={handleClose}>
              <ArrowBack />
            </IconButton>
            {t('user:avatar.title')}
          </DialogTitle>
          <DialogContent>
            <IconButton className={classes.positionRight}>
              <Help className={classes.spanWhite} />
            </IconButton>

            <div style={{ marginTop: '2rem' }}>
              <InputText
                value={avatarName}
                handleInputChange={handleAvatarNameChange}
                name="avatarname"
                formErrors={[]}
              />
              <InputText
                value={description}
                handleInputChange={(e) => setDescription(e.target.value)}
                name="description"
                formErrors={[]}
              />

              <Button className={classes.saveBtn} onClick={() => setSelectUse(!selectUse)} style={{ width: '97%' }}>
                {!selectUse ? 'Upload files' : 'Use url instead'}
              </Button>
              {!selectUse ? (
                <InputText value={avatarUrl} handleInputChange={handleAvatarUrlChange} formErrors={[]} name="avatar" />
              ) : (
                <label htmlFor="contained-button-file" style={{ marginRight: '8px' }}>
                  <Input
                    accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
                    id="contained-button-file"
                    type="file"
                    // onChange={handleAvatarChange}
                  />
                  <Button
                    variant="contained"
                    component="span"
                    // classes={{ root: classes.rootBtn }}
                    endIcon={<SystemUpdateAlt />}
                  >
                    Avatar
                  </Button>
                </label>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button className={classes.saveBtn} onClick={uploadByUrls}>
              Upload
            </Button>
            <Button onClick={handleClose} className={classes.saveBtn}>
              Cancel
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default AvatarCreate
