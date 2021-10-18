import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import { Edit, Save } from '@material-ui/icons'
import Skeleton from '@material-ui/lab/Skeleton'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useAuthState } from '../../../user/state/AuthState'
import { UserService } from '../../state/UserService'
import { useDispatch } from '../../../store'
import InputBase from '@material-ui/core/InputBase'

import { useUserStyles, useUserStyle } from './styles'
import { useUserState } from '../../state/UserState'
import { validateUserForm } from './validation'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { useScopeState } from '../../state/ScopeState'
import { ScopeService } from '../../state/ScopeService'
import { AuthService } from '../../../user/state/AuthService'

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
    scopeType: [],
    formErrors: {
      name: '',
      avatar: '',
      scopeType: ''
    }
  })
  const [error, setError] = React.useState('')
  const [openWarning, setOpenWarning] = React.useState(false)
  const user = useAuthState().user
  const adminUserState = useUserState()
  const userRole = adminUserState.userRole
  const userRoleData = userRole ? userRole.userRole.value : []
  const singleUser = adminUserState.singleUser
  const singleUserData = singleUser.singleUser
  const staticResource = adminUserState.staticResource
  const staticResourceData = staticResource.staticResource
  const adminScopeState = useScopeState()
  const adminScopes = adminScopeState.scopeType.scopeType

  const handleClick = () => {
    setOpenDialog(true)
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  React.useEffect(() => {
    const fetchData = async () => {
      AuthService.doLoginAuto(false)
      await UserService.fetchUserRole()
    }
    if (adminUserState.users.updateNeeded.value === true && user.id.value) fetchData()
    if ((user.id.value && singleUser.updateNeeded.value == true) || refetch) {
      UserService.fetchSingleUserAdmin(userAdmin.id)
    }
    if (user.id.value && staticResource.updateNeeded.value) {
      UserService.fetchStaticResource()
    }
    if (adminScopeState.scopeType.updateNeeded.value && user.id.value) {
      ScopeService.getScopeTypeService()
    }
  }, [
    adminUserState.users.updateNeeded.value,
    adminUserState.staticResource.updateNeeded.value,
    user.id.value,
    refetch,
    singleUser.updateNeeded.value,
    adminScopeState.scopeType.updateNeeded.value
  ])

  console.log(
    adminUserState.users.updateNeeded.value,
    adminUserState.staticResource.updateNeeded.value,
    user.id.value,
    refetch,
    singleUser.updateNeeded.value,
    adminScopeState.scopeType.updateNeeded.value
  )

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
        scopeType: userAdmin.scopes || []
      })
    }
  }, [singleUserData?.id?.value])

  const defaultProps = {
    options: userRoleData,
    getOptionLabel: (option: any) => option.role
  }

  const patchUserRole = async (user: any, role: string) => {
    await UserService.updateUserRole(user, role)
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
      scopeType: state.scopeType
    }

    let temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.avatar) {
      temp.avatar = "Avatar can't be empty"
    }
    if (!state.scopeType) {
      temp.scopeType = "Scope type can't be empty"
    }
    if (!state.scopeType.length) {
      temp.scopeType = "Scope can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (validateUserForm(state, state.formErrors)) {
      UserService.patchUser(userAdmin.id, data)
      setState({
        ...state,
        name: '',
        avatar: '',
        scopeType: []
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
        scopeType: ''
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
                      <Skeleton animation="wave" variant="circle" width={40} height={40} />
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
                className={state.formErrors.scopeType.length > 0 ? classes.redBorder : classes.createInput}
              >
                <Autocomplete
                  onChange={(event, value) =>
                    setState({ ...state, scopeType: value, formErrors: { ...state.formErrors, scopeType: '' } })
                  }
                  multiple
                  value={state.scopeType}
                  className={classes.selector}
                  classes={{ paper: classx.selectPaper, inputRoot: classes.select }}
                  id="tags-standard"
                  options={adminScopes.value}
                  disableCloseOnSelect
                  filterOptions={(options) =>
                    options.filter(
                      (option) => state.scopeType.find((scopeType) => scopeType.type === option.type) == null
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
                      scopeType: userAdmin.scopes || []
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
