import React from 'react'
import Container from '@material-ui/core/Container'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import { formValid } from './validation'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { getScopeTypeService } from '../../reducers/admin/scope/service'
import { selectScopeState } from '../../reducers/admin/scope/selector'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { useStyles, useStyle } from './styles'

interface Props {
  groupAdmin: any
  closeEditModal: any
  adminScopeState?: any
  getScopeTypeService?: any
  authState?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getScopeTypeService: bindActionCreators(getScopeTypeService, dispatch)
})

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    adminScopeState: selectScopeState(state)
  }
}

const EditGroup = (props: Props) => {
  const classes = useStyles()
  const classx = useStyle()

  const { groupAdmin, closeEditModal, authState, adminScopeState } = props
  const user = authState.get('user')
  const adminScopes = adminScopeState.get('scopeType').get('scopeType')

  const [state, setState] = React.useState({
    name: groupAdmin.name,
    description: groupAdmin.description,
    scopeType: groupAdmin.scopes,
    formErrors: {
      name: '',
      description: '',
      scopeType: ''
    }
  })

  React.useEffect(() => {
    if (adminScopeState.get('scopeType').get('updateNeeded') && user.id) {
      getScopeTypeService()
    }
  }, [adminScopeState, user])

  const handleChange = () => {}

  const onSubmitHandler = (e) => {}

  return (
    <Container maxWidth="sm" className={classes.marginTp}>
      <form onSubmit={(e) => onSubmitHandler(e)}>
        <DialogTitle id="form-dialog-title" className={classes.texAlign}>
          Create New Group
        </DialogTitle>
        <label>Name</label>
        <Paper component="div" className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}>
          <InputBase
            className={classes.input}
            name="name"
            placeholder="Enter group name"
            style={{ color: '#fff' }}
            autoComplete="off"
            value={state.name}
            onChange={handleChange}
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
            onChange={handleChange}
          />
        </Paper>

        <label>Grant access</label>
        <Paper component="div" className={classes.createInput}>
          <Autocomplete
            onChange={(event, value) =>
              setState({ ...state, scopeType: value, formErrors: { ...state.formErrors, scopeType: '' } })
            }
            multiple
            className={classes.selector}
            classes={{ paper: classx.selectPaper, inputRoot: classes.select }}
            id="tags-standard"
            value={groupAdmin.scopes}
            options={adminScopes}
            getOptionLabel={(option) => option.type}
            renderInput={(params) => <TextField {...params} placeholder="Select access" />}
          />
        </Paper>

        <DialogActions className={classes.marginTp}>
          <Button type="submit" className={classes.saveBtn}>
            Submit
          </Button>
          <Button
            onClick={() => {
              setState({
                ...state,
                name: '',
                description: '',
                formErrors: { ...state.formErrors, name: '', description: '' }
              })
              closeEditModal(false)
            }}
            className={classes.saveBtn}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Container>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(EditGroup)
