import React from 'react'
import Drawer from '@mui/material/Drawer'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Edit, Save } from '@mui/icons-material'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import { useAuthState } from '../../../user/services/AuthService'
import { UserService } from '../../services/UserService'
import { useDispatch } from '../../../store'
import InputBase from '@mui/material/InputBase'

import { useUserStyles, useUserStyle } from './styles'
import { useUserState } from '../../services/UserService'
import { validateUserForm } from './validation'
import MuiAlert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { useScopeState } from '../../services/ScopeService'
import { ScopeService } from '../../services/ScopeService'
import { AuthService } from '../../../user/services/AuthService'
import { useScopeTypeState, ScopeTypeService } from '../../services/ScopeTypeService'
import { useUserRoleState, UserROleService } from '../../services/UserRoleService'
import { useSingleUserState, SingleUserService } from '../../services/SingleUserService'
import { useStaticResourceState, staticResourceService } from '../../services/StaticResourceService'

interface Props {
  openView: boolean
  userAdmin: any
  closeViewModel?: any
  //doLoginAuto?: any
}

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const ViewUser = (props: Props) => {
  const classx = useUserStyle()
  const classes = useUserStyles()
  const dispatch = useDispatch()

  const {
    openView,
    closeViewModel,
    userAdmin
    //doLoginAuto
  } = props
  const [openDialog, setOpenDialog] = React.useState(false)
  const [status, setStatus] = React.useState('')
  const [editMode, setEditMode] = React.useState(false)
  const [refetch, setRefetch] = React.useState(0)

  const [state, setState] = React.useState({
    name: '',
    avatar: '',
    scopeTypes: [],
    formErrors: {
      name: '',
      avatar: '',
      scopeTypes: ''
    }
  })
  const [error, setError] = React.useState('')
  const [openWarning, setOpenWarning] = React.useState(false)
  const user = useAuthState().user
  const adminUserState = useUserState()
  const userRole = useUserRoleState()
  const userRoleData = userRole ? userRole.userRole.value : []
  const singleUser = useSingleUserState()
  const singleUserData = singleUser.singleUser
  const staticResource = useStaticResourceState()
  const staticResourceData = staticResource.staticResource
  const adminScopeState = useScopeState()
  const adminScopeTypeState = useScopeTypeState()

  const handleClick = () => {
    setOpenDialog(true)
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  React.useEffect(() => {
    const fetchData = async () => {
      AuthService.doLoginAuto(false)
      await UserROleService.fetchUserRole()
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
    adminScopeTypeState.updateNeeded.value
  ])

  React.useEffect(() => {
    if (!refetch) {
      setRefetch(refetch + 1)
    }
  }, [userAdmin.id, refetch])

  React.useEffect(() => {
    if (singleUserData?.value) {
      setState({
        ...state,
        name: userAdmin.name || '',
        avatar: userAdmin.avatarId || '',
        scopeTypes: userAdmin.scopes || []
      })
    }
  }, [singleUserData?.id?.value])

  const defaultProps = {
    options: userRoleData,
    getOptionLabel: (option: any) => option.role
  }

  const patchUserRole = async (user: any, role: string) => {
    await UserROleService.updateUserRole(user, role)
    handleCloseDialog()
    setRefetch(refetch + 1)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required!' : ''
        break
      case 'avatar':
        temp.avatar = value.length < 2 ? 'Avatar is required!' : ''
        break
      default:
        break
    }
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data = {
      name: state.name,
      avatarId: state.avatar,
      scopeTypes: state.scopeTypes
    }

    let temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.avatar) {
      temp.avatar = "Avatar can't be empty"
    }
    if (!state.scopeTypes) {
      temp.scopeTypes = "Scope type can't be empty"
    }
    if (!state.scopeTypes.length) {
      temp.scopeTypes = "Scope can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (validateUserForm(state, state.formErrors)) {
      UserService.patchUser(userAdmin.id, data)
      setState({
        ...state,
        name: '',
        avatar: '',
        scopeTypes: []
      })
      setEditMode(false)
      closeViewModel(false)
    } else {
      setError('Please fill all required field')
      setOpenWarning(true)
    }
  }

  const handleCloseWarning = (event, reason) => {
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
        scopeTypes: ''
      }
    })
  }

  return (
    <React.Fragment>
      <Drawer anchor="right" open={openView} onClose={() => handleCloseDrawer()} classes={{ paper: classx.paper }}>
        {userAdmin && (
          <Paper elevation={3} className={classes.paperHeight}>
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
                      <Chip label={singleUserData?.userRole?.value} onDelete={handleClick} deleteIcon={<Edit />} />
                    ) : (
                      <Chip label="None" onDelete={handleClick} deleteIcon={<Edit />} />
                    )}
                  </div>
                </Grid>
              </Grid>
            </Container>

            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              aria-labelledby="form-dialog-title"
              classes={{ paper: classx.paperDialog }}
            >
              <DialogTitle id="form-dialog-title">Do you really want to change role for {userAdmin.name}? </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  In order to change role for {userAdmin.name} search from the list or select user role and submit.
                </DialogContentText>
                <Autocomplete
                  onChange={(e, newValue) => {
                    if (newValue) {
                      setStatus(newValue.role as string)
                    } else {
                      setStatus('')
                    }
                  }}
                  {...defaultProps}
                  id="debug"
                  debug
                  renderInput={(params) => <TextField {...params} label="User Role" />}
                />
              </DialogContent>
              <DialogActions className={classes.marginTop}>
                <Button onClick={handleCloseDialog} className={classx.spanDange}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    patchUserRole(userAdmin.id, status)
                  }}
                  color="primary"
                >
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        )}
        <Container maxWidth="sm">
          {editMode ? (
            <div className={classes.mt10}>
              <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
                {' '}
                Update personal Information{' '}
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
                    MenuProps={{ classes: { paper: classx.selectPaper } }}
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

              <label>Grant scope</label>
              <Paper
                component="div"
                className={state.formErrors.scopeTypes.length > 0 ? classes.redBorder : classes.createInput}
              >
                <Autocomplete
                  onChange={(event, value) =>
                    setState({ ...state, scopeTypes: value, formErrors: { ...state.formErrors, scopeTypes: '' } })
                  }
                  multiple
                  value={state.scopeTypes}
                  className={classes.selector}
                  classes={{ paper: classx.selectPaper, inputRoot: classes.select }}
                  id="tags-standard"
                  options={adminScopeTypeState.scopeTypes.value}
                  disableCloseOnSelect
                  filterOptions={(options) =>
                    options.filter(
                      (option) => state.scopeTypes.find((scopeType) => scopeType.type === option.type) == null
                    )
                  }
                  getOptionLabel={(option) => option.type}
                  renderInput={(params) => <TextField {...params} placeholder="Select scope" />}
                />
              </Paper>
            </div>
          ) : (
            <Grid container spacing={3} className={classes.mt5}>
              <Typography variant="h4" component="h4" className={`${classes.mb20px} ${classes.headingFont}`}>
                Personal Information{' '}
              </Typography>
              <Grid item xs={6} sm={6}>
                <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                  Location:
                </Typography>
                <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                  Avatar:
                </Typography>
                <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                  Invite Code:
                </Typography>
                <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                  Instance:
                </Typography>
              </Grid>
              <Grid item xs={4} sm={6}>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.party?.location?.name || <span className={classx.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.avatarId || <span className={classx.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.inviteCode || <span className={classx.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                  {userAdmin?.party?.instance?.ipAddress || <span className={classx.spanNone}>None</span>}
                </Typography>
              </Grid>
              <Typography variant="h5" component="h5" className={`${classes.mb20px} ${classes.headingFont}`}>
                User scope
              </Typography>
              <div className={classes.scopeContainer}>
                {singleUserData?.scopes?.value?.map((el, index) => {
                  const [label, type] = el.type.split(':')
                  return (
                    <Grid container spacing={3} style={{ paddingLeft: '10px', width: '100%' }} key={el.id}>
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
                <Button onClick={handleSubmit} className={classx.saveBtn}>
                  <span style={{ marginRight: '15px' }}>
                    <Save />
                  </span>{' '}
                  Submit
                </Button>
                <Button
                  className={classx.saveBtn}
                  onClick={() => {
                    setEditMode(false)
                  }}
                >
                  CANCEL
                </Button>
              </div>
            ) : (
              <div className={classes.marginTop}>
                <Button
                  className={classx.saveBtn}
                  onClick={() => {
                    setEditMode(true)
                    setState({
                      ...state,
                      name: userAdmin.name || '',
                      avatar: userAdmin.avatarId || '',
                      scopeTypes: userAdmin.scopes || []
                    })
                  }}
                >
                  EDIT
                </Button>
                <Button onClick={() => handleCloseDrawer()} className={classx.saveBtn}>
                  CANCEL
                </Button>
              </div>
            )}
          </DialogActions>
        </Container>
        <Snackbar
          open={openWarning}
          autoHideDuration={6000}
          onClose={handleCloseWarning}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseWarning} severity="warning">
            {' '}
            {error}{' '}
          </Alert>
        </Snackbar>
      </Drawer>
    </React.Fragment>
  )
}

export default ViewUser
