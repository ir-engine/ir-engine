import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GroupScope } from '@xrengine/common/src/interfaces/Group'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'

import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete, { AutoCompleteData } from '../../common/AutoComplete'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminGroupService } from '../../services/GroupService'
import { AdminScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  handleClose: (open: boolean) => void
  //adminGroupState?: any
}

const CreateGroup = ({ open, handleClose }: Props) => {
  const user = useAuthState().user
  const adminScopeTypeState = useScopeTypeState()
  const { t } = useTranslation()

  const [state, setState] = useState({
    name: '',
    description: '',
    scopeTypes: [] as GroupScope[],
    formErrors: {
      name: '',
      description: '',
      scopeTypes: ''
    }
  })

  useEffect(() => {
    if (adminScopeTypeState.updateNeeded.value && user.id.value) {
      AdminScopeTypeService.getScopeTypeService()
    }
  }, [adminScopeTypeState.updateNeeded.value, user])

  const handleChange = (event) => {
    const { name, value } = event.target

    let temp = { ...state.formErrors }
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const onSubmitHandler = (event) => {
    event.preventDefault()
    const { name, description, scopeTypes } = state

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.group.nameCantEmpty'),
      description: state.description ? '' : t('admin:components.group.descriptionCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      AdminGroupService.createGroupByAdmin({ name, description, scopeTypes })
      setState({
        ...state,
        name: '',
        description: '',
        scopeTypes: []
      })
      handleClose(false)
    }
  }

  const scopeData: AutoCompleteData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  const handleChangeScopeType = (scope) => {
    if (scope.length) setState({ ...state, scopeTypes: scope, formErrors: { ...state.formErrors, scopeTypes: '' } })
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: styles.paperDrawer }} anchor="right" open={open} onClose={() => handleClose(false)}>
        <Container maxWidth="sm" className={styles.mt20}>
          <form onSubmit={(e) => onSubmitHandler(e)}>
            <DialogTitle id="form-dialog-title" className={styles.textAlign}>
              {t('admin:components.group.createNewGroup')}
            </DialogTitle>

            <InputText
              name="name"
              label={t('admin:components.group.name')}
              placeholder={t('admin:components.group.enterGroupName')}
              value={state.name}
              error={state.formErrors.name}
              onChange={handleChange}
            />

            <InputText
              name="description"
              label={t('admin:components.group.description')}
              placeholder={t('admin:components.group.enterGroupDescription')}
              value={state.description}
              error={state.formErrors.description}
              onChange={handleChange}
            />

            <AutoComplete
              data={scopeData}
              label={t('admin:components.group.grantScope')}
              onChange={handleChangeScopeType}
            />

            <DialogActions className={styles.mt20}>
              <Button type="submit" className={styles.submitButton}>
                {t('admin:components.group.submit')}
              </Button>
              <Button
                onClick={() => {
                  setState({
                    ...state,
                    name: '',
                    description: '',
                    formErrors: { ...state.formErrors, name: '', description: '' }
                  })
                  handleClose(false)
                }}
                className={styles.cancelButton}
              >
                {t('admin:components.group.cancel')}
              </Button>
            </DialogActions>
          </form>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default CreateGroup
