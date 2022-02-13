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
import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
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
import { useStyles } from '../../styles/ui'

interface Props {
  openView: boolean
  userAdmin: any
  closeViewModel?: any
}

interface ScopeData {
  type: string
}

interface InputSelectProps {
  value: string
  label: string
}

const ViewUser = (props: Props) => {
  const classes = useStyles()
  const { openView, closeViewModel, userAdmin } = props
  const [editMode, setEditMode] = useState(false)
  const [refetch, setRefetch] = useState(0)

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
      SingleUserService.fetchSingleUserAdmin(userAdmin.id)
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
    const temp: ScopeData[] = userAdmin.scopes.map((el) => {
      return {
        type: el.type
      }
    })
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
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data = {
      name: state.name,
      avatarId: state.avatar,
      userRole: state.userRole,
      scopes: state.scopes
    }
    let temp = state.formErrors
    temp.name = !state.name ? "Name can't be empty" : ''
    temp.avatar = !state.avatar ? "Avatar can't be empty" : ''
    temp.userRole = !state.userRole ? "User role can't be empty" : ''
    temp.scopes = !state.scopes.length ? "Scope type can't be empty" : ''
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      UserService.patchUser(userAdmin.id, data)
      setState({ ...state, name: '', avatar: '', userRole: '', scopes: [] })
      setEditMode(false)
      closeViewModel(false)
    } else {
      setError('Please fill all required field')
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
    closeViewModel(false)
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
        classes={{ paper: classes.paperDrawer }}
      >
        {userAdmin && (
          <Paper elevation={3} className={classes.rootPaper}>
            <Container maxWidth="sm" className={classes.pad}>
              <Grid container spacing={2} className={classes.centering}>
                <Grid item xs={4}>
                  <Avatar className={classes.large}>
                    {!userAdmin.avatarId ? (
                      <Skeleton animation="wave" variant="circular" width={40} height={40} />
                    ) : (
                      userAdmin.avatarId.charAt(0).toUpperCase()
                    )}
                  </Avatar>
                </Grid>
                <Grid item xs={8}>
                  <div>
                    <Typography variant="h4" component="span" className={classes.typoFontTitle}>
                      {userAdmin.name}
                    </Typography>
                    <br />
                    {userAdmin.userRole ? (
                      <Chip label={userAdmin.userRole} className={classes.spanWhite} />
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
            <div className={classes.mt10}>
              <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
                Update personal Information
              </Typography>
              <label>Name</label>
              <Paper
                component="div"
                className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="name"
                  placeholder="Enter name"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.name}
                  onChange={handleInputChange}
                />
              </Paper>
              <label>Avatar</label>
              <Paper
                component="div"
                className={state.formErrors.avatar.length > 0 ? classes.redBorder : classes.createInput}
              >
                <FormControl fullWidth>
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.avatar}
                    fullWidth
                    displayEmpty
                    onChange={handleInputChange}
                    className={classes.select}
                    name="avatar"
                    MenuProps={{ classes: { paper: classes.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select avatar</em>
                    </MenuItem>
                    {staticResourceData.value.map((el) => (
                      <MenuItem value={el.name} key={el.id}>
                        {el.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
              <label>User role</label>
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
                label="Grant Scope"
                handleChangeScopeType={handleChangeScopeType}
                scopes={state.scopes as any}
              />
            </div>
          ) : (
            <Grid container spacing={3} className={classes.mt5}>
              <Typography variant="h4" component="h4" className={`${classes.mb20px} ${classes.headingFont}`}>
                Personal Information
              </Typography>
              <Grid item xs={6} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  Location:
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  Avatar:
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  Invite Code:
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  Instance:
                </Typography>
              </Grid>
              <Grid item xs={4} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.party?.location?.name || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.avatarId || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.inviteCode || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.party?.instance?.ipAddress || <span className={classes.spanNone}>None</span>}
                </Typography>
              </Grid>
              <Typography variant="h5" component="h5" className={`${classes.mb20px} ${classes.headingFont}`}>
                User scope
              </Typography>
              <div className={classes.scopeContainer}>
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
                        <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                          {label}:
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Chip label={type} />
                      </Grid>
                    </Grid>
                  )
                })}
              </div>
            </Grid>
          )}
          <DialogActions className={classes.mb10}>
            {editMode ? (
              <div className={classes.marginTop}>
                <Button onClick={handleSubmit} className={classes.saveBtn}>
                  <span style={{ marginRight: '15px' }}>
                    <Save />
                  </span>{' '}
                  Submit
                </Button>
                <Button
                  className={classes.saveBtn}
                  onClick={() => {
                    initiateData()
                    setEditMode(false)
                  }}
                >
                  CANCEL
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
                  EDIT
                </Button>
                <Button onClick={() => handleCloseDrawer()} className={classes.saveBtn}>
                  CANCEL
                </Button>
              </div>
            )}
          </DialogActions>
        </Container>
      </Drawer>
      <AlertMessage open={openWarning} handleClose={handleCloseWarning} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default ViewUser
