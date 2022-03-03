import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { CreateEditAdminAvatar } from '@xrengine/common/src/interfaces/AvatarInterface'

import { Save } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import AlertMessage from '../../common/AlertMessage'
import { validateForm } from '../../common/validation/formValidation'
import { AvatarService } from '../../services/AvatarService'
import { useStyles } from '../../styles/ui'

interface Props {
  openView: boolean
  closeViewModel?: (open: boolean) => void
  avatarData?: AvatarInterface
}

const ViewAvatar = (props: Props) => {
  const classes = useStyles()
  const { openView, closeViewModel, avatarData } = props
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({
    name: '',
    key: '',
    url: '',
    description: '',
    formErrors: {
      name: '',
      key: '',
      url: '',
      description: ''
    }
  })
  const { t } = useTranslation()
  const [openAlter, setOpenAlter] = useState(false)
  const [error, setError] = useState('')
  const handleCloseDrawer = () => {
    closeViewModel && closeViewModel(false)
  }

  const initialData = () => {
    setState({
      ...state,
      name: avatarData?.name || '',
      key: avatarData?.key || '',
      url: avatarData?.url || '',
      description: avatarData?.description || '',
      formErrors: {
        name: '',
        key: '',
        url: '',
        description: ''
      }
    })
  }

  useEffect(() => {
    if (avatarData) {
      initialData()
    }
  }, [avatarData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const updateAvatar = async () => {
    const data: CreateEditAdminAvatar = {
      name: state.name,
      description: state.description,
      url: state.url,
      staticResourceType: 'avatar'
    }
    let temp = state.formErrors
    if (!state.name) {
      temp.name = t('admin:components.avatar.nameCantEmpty')
    }
    if (!state.description) {
      temp.description = t('admin:components.avatar.descriptionCantEmpty')
    }
    if (!state.url) {
      temp.url = t('admin:components.avatar.avatarUrlCantEmpty')
    }
    if (validateForm(state, state.formErrors) && avatarData) {
      await AvatarService.updateAdminAvatar(avatarData.id, data)
      setEditMode(false)
      closeViewModel && closeViewModel(false)
    } else {
      setError(t('admin:components.avatar.fillRequiredFields'))
      setOpenAlter(true)
    }
  }

  const handleCloseAlter = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenAlter(false)
  }

  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={openView}
        onClose={() => handleCloseDrawer()}
        classes={{ paper: classes.paperDrawer }}
      >
        {avatarData && (
          <Paper elevation={3} className={classes.rootPaper}>
            <Container maxWidth="sm" className={classes.pad}>
              <Grid container spacing={2} className={classes.centering}>
                <Grid item xs={4}>
                  <Avatar className={classes.large} alt="avatar" src={avatarData.url} />
                </Grid>
                <Grid item xs={8}>
                  <div>
                    <Typography variant="h4" component="span" className={classes.typoFontTitle}>
                      {avatarData.name}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </Container>
          </Paper>
        )}
        <Container maxWidth="sm">
          {editMode ? (
            <div className={classes.mt10}>
              <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
                {t('user:avatar.uploadAvatarInfo')}
              </Typography>
              <label>{t('user:avatar.name')}</label>
              <Paper
                component="div"
                className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="name"
                  placeholder={t('user:avatar.enterName')}
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.name}
                  onChange={handleInputChange}
                />
              </Paper>
              <label>Description</label>
              <Paper
                component="div"
                className={state.formErrors.description.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="description"
                  placeholder="Enter description"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.description}
                  onChange={handleInputChange}
                />
              </Paper>
              <label>{t('user:avatar.avatarUrl')}</label>
              <Paper
                component="div"
                className={state.formErrors.url.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="url"
                  placeholder="Enter url"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.url}
                  onChange={handleInputChange}
                />
              </Paper>
            </div>
          ) : (
            <div>
              <Typography
                variant="h4"
                component="h4"
                className={`${classes.mb20px} ${classes.mt5} ${classes.headingFont}`}
              >
                {t('user:avatar.avatarInformation')}
              </Typography>
              <Grid container spacing={3} className={classes.mt5}>
                <Grid item xs={6} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {t('user:avatar.name')}:
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {t('user:avatar.description')}:
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {t('user:avatar.key')}:
                  </Typography>
                </Grid>
                <Grid item xs={4} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {avatarData?.name || <span className={classes.spanNone}>{t('user:avatar.none')}</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {avatarData?.description || <span className={classes.spanNone}>{t('user:avatar.none')}</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {avatarData?.key || <span className={classes.spanNone}>{t('user:avatar.none')}</span>}
                  </Typography>
                </Grid>
              </Grid>
              <Typography variant="h5" component="h5" className={`${classes.mb20px} ${classes.headingFont}`}>
                {t('user:avatar.avatar')}
              </Typography>
              <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                {avatarData?.url || <span className={classes.spanNone}>{t('user:avatar.none')}</span>}
              </Typography>
              <div className={classes.scopeContainer}></div>
            </div>
          )}
          <DialogActions className={classes.mb10}>
            {editMode ? (
              <div className={classes.marginTop}>
                <Button onClick={updateAvatar} className={classes.saveBtn}>
                  <span style={{ marginRight: '15px' }}>
                    <Save />
                  </span>
                  {t('user:avatar.submit')}
                </Button>
                <Button
                  className={classes.saveBtn}
                  onClick={() => {
                    initialData()
                    setEditMode(false)
                  }}
                >
                  {t('user:avatar.cancel')}
                </Button>
              </div>
            ) : (
              <div className={classes.marginTop}>
                <Button
                  className={classes.saveBtn}
                  onClick={() => {
                    setEditMode(true)
                  }}
                >
                  {t('user:avatar.edit')}
                </Button>
                <Button onClick={() => handleCloseDrawer()} className={classes.saveBtn}>
                  {t('user:avatar.cancel')}
                </Button>
              </div>
            )}
          </DialogActions>
        </Container>
      </Drawer>
      <AlertMessage open={openAlter} handleClose={handleCloseAlter} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default ViewAvatar
