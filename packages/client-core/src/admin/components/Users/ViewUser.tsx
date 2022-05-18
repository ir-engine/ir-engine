import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { User } from '@xrengine/common/src/interfaces/User'
import { CreateEditUser } from '@xrengine/common/src/interfaces/User'

import { Save } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../../user/services/AuthService'
import AlertMessage from '../../common/AlertMessage'
import AutoComplete from '../../common/AutoComplete'
import InputSelect from '../../common/InputSelect'
import { validateForm } from '../../common/validation/formValidation'
import { ScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import { SingleUserService, useSingleUserState } from '../../services/SingleUserService'
import { staticResourceService, useStaticResourceState } from '../../services/StaticResourceService'
import { UserRoleService, useUserRoleState } from '../../services/UserRoleService'
import { UserService, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'

interface Props {
  openView: boolean
  userAdmin: User
  closeViewModal?: (open: boolean) => void
}

interface ScopeData {
  type: string
}

interface InputSelectProps {
  value: string
  label: string
}

const ViewUser = (props: Props) => {
  const { openView, closeViewModal, userAdmin } = props
  const [editMode, setEditMode] = useState(false)
  const [refetch, setRefetch] = useState(0)
  const { t } = useTranslation()
  const [state, setState] = useState({
    name: '',
    avatar: '',
    userRole: '',
    scopes: [] as Array<AdminScopeType>,
    formErrors: {
      name: '',
      avatar: '',
      userRole: '',
      scopes: ''
    }
  })
  const [error, setError] = useState('')
  const [openWarning, setOpenWarning] = useState(false)
  const user = useAuthState().user
  const adminUserState = useUserState()
  const singleUser = useSingleUserState()
  const singleUserData = singleUser.singleUser
  const staticResource = useStaticResourceState()
  const staticResourceData = staticResource.staticResource
  const adminScopeTypeState = useScopeTypeState()
  const userRole = useUserRoleState()

  useEffect(() => {
    const fetchData = async () => {
      await UserRoleService.fetchUserRole()
    }
    if (userRole.updateNeeded.value === true && user.id.value) fetchData()

    if ((user.id.value && singleUser.updateNeeded.value == true) || refetch) {
      userAdmin.id && SingleUserService.fetchSingleUserAdmin(userAdmin.id)
    }
    if (user.id.value && staticResource.updateNeeded.value) {
      staticResourceService.fetchStaticResource()
    }
    if (adminScopeTypeState.updateNeeded.value && user.id.value) {
      ScopeTypeService.getScopeTypeService()
    }
  }, [
    adminUserState.updateNeeded.value,
    user.id.value,
    refetch,
    singleUser.updateNeeded.value,
    adminScopeTypeState.updateNeeded.value,
    userRole.updateNeeded.value
  ])

  useEffect(() => {
    if (!refetch) {
      setRefetch(refetch + 1)
    }
  }, [userAdmin.id, refetch])

  const initiateData = () => {
    const temp: ScopeData[] =
      userAdmin?.scopes?.map((el) => {
        return {
          type: el.type
        }
      }) || []
    setState({
      ...state,
      name: userAdmin.name || '',
      avatar: userAdmin.avatarId || '',
      userRole: userAdmin.userRole || '',
      scopes: temp as any
    })
  }

  useEffect(() => {
    if (singleUserData?.value) {
      initiateData()
    }
  }, [singleUserData?.id?.value])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} ${t('admin:components.user.isRequired')}` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data: CreateEditUser = {
      name: state.name,
      avatarId: state.avatar,
      userRole: state.userRole,
      scopes: state.scopes
    }
    let temp = state.formErrors
    temp.name = !state.name ? t('admin:components.user.nameCantEmpty') : ''
    temp.avatar = !state.avatar ? t('admin:components.user.avatarCantEmpty') : ''
    temp.userRole = !state.userRole ? t('admin:components.user.userRoleCantEmpty') : ''
    temp.scopes = !state.scopes.length ? t('admin:components.user.scopeTypeCantEmpty') : ''
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors) && userAdmin.id) {
      UserService.patchUser(userAdmin.id, data)
      setState({ ...state, name: '', avatar: '', userRole: '', scopes: [] })
      setEditMode(false)
      closeViewModal && closeViewModal(false)
    } else {
      setError(t('admin:components.user.fillRequiredField'))
      setOpenWarning(true)
    }
  }

  const handleCloseWarning = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenWarning(false)
  }

  const handleCloseDrawer = () => {
    setError('')
    setOpenWarning(false)
    closeViewModal && closeViewModal(false)
    setState({
      ...state,
      formErrors: {
        ...state.formErrors,
        name: '',
        avatar: '',
        userRole: '',
        scopes: ''
      }
    })
  }

  const handleChangeScopeType = (scope) => {
    setState({ ...state, scopes: scope, formErrors: { ...state.formErrors, scopes: '' } })
  }

  const scopeData: ScopeData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  const userRoleData: InputSelectProps[] = userRole.userRole.value.map((el) => {
    return {
      value: el.role,
      label: el.role
    }
  })

  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={openView}
        onClose={() => handleCloseDrawer()}
        classes={{ paper: styles.paperDrawer }}
      >
        {userAdmin && (
          <Paper elevation={3} className={styles.rootPaper}>
            <Container maxWidth="sm" className={styles.pad}>
              <Grid container spacing={2} className={styles.centering}>
                <Grid item xs={4}>
                  <Avatar className={styles.large}>
                    {!userAdmin.avatarId ? (
                      <Skeleton animation="wave" variant="circular" width={40} height={40} />
                    ) : (
                      userAdmin.avatarId.charAt(0).toUpperCase()
                    )}
                  </Avatar>
                </Grid>
                <Grid item xs={8}>
                  <div>
                    <Typography variant="h4" component="span" className={styles.typoFontTitle}>
                      {userAdmin.name}
                    </Typography>
                    <br />
                    {userAdmin.userRole ? (
                      <Chip label={userAdmin.userRole} className={styles.spanWhite} />
                    ) : (
                      <Chip label="None" />
                    )}
                  </div>
                </Grid>
              </Grid>
            </Container>
          </Paper>
        )}
        <Container maxWidth="sm">
          {editMode ? (
            <div className={styles.mt10}>
              <Typography variant="h4" component="h4" className={`${styles.mb10} ${styles.headingFont}`}>
                {t('admin:components.user.updatePersonalInfo')}
              </Typography>
              <label>{t('admin:components.user.name')}</label>
              <Paper
                component="div"
                className={state.formErrors.name.length > 0 ? styles.redBorder : styles.createInput}
              >
                <InputBase
                  className={styles.input}
                  name="name"
                  placeholder={t('admin:components.user.enterName')}
                  autoComplete="off"
                  value={state.name}
                  onChange={handleInputChange}
                />
              </Paper>
              <label>{t('admin:components.user.avatar')}</label>
              <Paper
                component="div"
                className={state.formErrors.avatar.length > 0 ? styles.redBorder : styles.createInput}
              >
                <FormControl fullWidth>
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.avatar}
                    fullWidth
                    displayEmpty
                    onChange={handleInputChange}
                    className={styles.select}
                    name="avatar"
                    MenuProps={{ classes: { paper: styles.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>{t('admin:components.user.selectAvatar')}</em>
                    </MenuItem>
                    {staticResourceData.value.map((el) => (
                      <MenuItem value={el.name} key={el.id}>
                        {el.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
              <label>{t('admin:components.user.userRole')}</label>
              {user.id.value !== userAdmin.id && (
                <InputSelect
                  handleInputChange={handleInputChange}
                  value={state.userRole}
                  name="userRole"
                  menu={userRoleData}
                  formErrors={state.formErrors.userRole}
                />
              )}
              <AutoComplete
                data={scopeData}
                label={t('admin:components.user.grantScope')}
                handleChangeScopeType={handleChangeScopeType}
                scopes={state.scopes as any}
              />
            </div>
          ) : (
            <Grid container spacing={3} className={styles.mt5}>
              <Typography variant="h4" component="h4" className={`${styles.mb20px} ${styles.headingFont}`}>
                {t('admin:components.user.personalInfo')}
              </Typography>
              <Grid item xs={6} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {t('admin:components.user.location')}:
                </Typography>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {t('admin:components.user.avatar')}:
                </Typography>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {t('admin:components.user.inviteCode')}:
                </Typography>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {t('admin:components.user.instance')}:
                </Typography>
              </Grid>
              <Grid item xs={4} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {userAdmin?.party?.location?.name || (
                    <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
                  )}
                </Typography>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {userAdmin?.avatarId || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {userAdmin?.inviteCode || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                  {userAdmin?.party?.instance?.ipAddress || (
                    <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
                  )}
                </Typography>
              </Grid>
              <Typography variant="h5" component="h5" className={`${styles.mb20px} ${styles.headingFont}`}>
                {t('admin:components.user.userScope')}
              </Typography>
              <div className={styles.scopeContainer}>
                {singleUserData?.scopes?.value?.map((el, index) => {
                  const [label, type] = el.type.split(':')
                  return (
                    <Grid
                      container
                      spacing={3}
                      style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}
                      key={index}
                    >
                      <Grid item xs={8}>
                        <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
                          {label}:
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Chip label={type} className={styles.chip} />
                      </Grid>
                    </Grid>
                  )
                })}
              </div>
            </Grid>
          )}
          <DialogActions className={styles.mb10}>
            {editMode ? (
              <DialogActions>
                <Button onClick={handleSubmit} className={styles.submitButton}>
                  <span style={{ marginRight: '15px' }}>
                    <Save />
                  </span>{' '}
                  {t('admin:components.user.submit')}
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={() => {
                    initiateData()
                    setEditMode(false)
                  }}
                >
                  {t('admin:components.user.cancel')}
                </Button>
              </DialogActions>
            ) : (
              <DialogActions>
                <Button
                  className={styles.submitButton}
                  onClick={() => {
                    setEditMode(true)
                  }}
                >
                  {t('admin:components.user.edit')}
                </Button>
                <Button onClick={() => handleCloseDrawer()} className={styles.cancelButton}>
                  {t('admin:components.user.cancel')}
                </Button>
              </DialogActions>
            )}
          </DialogActions>
        </Container>
      </Drawer>
      <AlertMessage open={openWarning} handleClose={handleCloseWarning} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default ViewUser
