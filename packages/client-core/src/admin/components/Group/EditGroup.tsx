import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Group } from '@xrengine/common/src/interfaces/Group'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'

import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete, { AutoCompleteData } from '../../common/AutoComplete'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminGroupService } from '../../services/GroupService'
import { AdminScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import styles from '../../styles/admin.module.scss'

interface Props {
  groupAdmin: Group
  onClose: () => void
}

const EditGroup = ({ groupAdmin, onClose }: Props) => {
  const user = useAuthState().user
  const adminScopeTypeState = useScopeTypeState()
  const { t } = useTranslation()

  const [state, setState] = useState({
    name: groupAdmin.name,
    description: groupAdmin.description,
    scopeTypes: groupAdmin.scopes,
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

  const handleChange = (e) => {
    const { name, value } = e.target

    let temp = { ...state.formErrors }
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    const { name, description, scopeTypes } = state

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.group.nameCantEmpty'),
      description: state.description ? '' : t('admin:components.group.descriptionCantEmpty'),
      scopeTypes: state.scopeTypes && state.scopeTypes.length > 0 ? '' : t('admin:components.group.scopeCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      AdminGroupService.patchGroupByAdmin(groupAdmin.id, { name, description, scopeTypes })
      setState({
        ...state,
        name: '',
        description: '',
        scopeTypes: []
      })
      onClose()
    }
  }
  const handleChangeScopeType = (scope) => {
    setState({ ...state, scopeTypes: scope, formErrors: { ...state.formErrors, scopeTypes: '' } })
  }

  const scopeData: AutoCompleteData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  return (
    <Container maxWidth="sm" className={styles.mt20}>
      <form onSubmit={(e) => onSubmitHandler(e)}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.group.editGroup')}</DialogTitle>

        <InputText
          name="name"
          label={t('admin:components.group.name')}
          placeholder={t('admin:components.group.enterGroupName')}
          value={state.name ?? ''}
          error={state.formErrors.name}
          onChange={handleChange}
        />

        <InputText
          name="description"
          label={t('admin:components.group.description')}
          placeholder={t('admin:components.group.enterGroupDescription')}
          value={state.description ?? ''}
          error={state.formErrors.description}
          onChange={handleChange}
        />

        <AutoComplete
          data={scopeData}
          label={t('admin:components.group.groupScope')}
          defaultValue={state.scopeTypes}
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
              onClose()
            }}
            className={styles.cancelButton}
          >
            {t('admin:components.group.cancel')}
          </Button>
        </DialogActions>
      </form>
    </Container>
  )
}

export default EditGroup
