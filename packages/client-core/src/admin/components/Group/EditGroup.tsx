import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Group } from '@xrengine/common/src/interfaces/Group'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete from '../../common/AutoComplete'
import { validateForm } from '../../common/validation/formValidation'
import { GroupService } from '../../services/GroupService'
import { ScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import styles from '../../styles/admin.module.scss'

interface Props {
  groupAdmin: Group
  closeEditModal: (open: boolean) => void
  closeViewModal?: (open: boolean) => void
}
interface ScopeData {
  type: string
}

const EditGroup = (props: Props) => {
  const { groupAdmin, closeEditModal, closeViewModal } = props
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
      ScopeTypeService.getScopeTypeService()
    }
  }, [adminScopeTypeState.updateNeeded.value, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    const { name, description, scopeTypes } = state
    let temp = state.formErrors
    temp.name = !state.name ? t('admin:components.group.nameCantEmpty') : ''
    temp.description = !state.description ? t('admin:components.group.descriptionCantEmpty') : ''
    temp.scopeTypes = !state.scopeTypes?.length ? t('admin:components.group.scopeCantEmpty') : ''

    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      GroupService.patchGroupByAdmin(groupAdmin.id, { name, description, scopeTypes })
      setState({
        ...state,
        name: '',
        description: '',
        scopeTypes: []
      })
      closeEditModal(false)
      if (typeof closeViewModal === 'function') closeViewModal(false)
    }
  }
  const handleChangeScopeType = (scope) => {
    setState({ ...state, scopeTypes: scope, formErrors: { ...state.formErrors, scopeTypes: '' } })
  }

  const scopeData: ScopeData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  return (
    <Container maxWidth="sm" className={styles.mt20}>
      <form onSubmit={(e) => onSubmitHandler(e)}>
        <DialogTitle id="form-dialog-title" className={styles.textAlign}>
          {t('admin:components.group.editGroup')}
        </DialogTitle>
        <label>{t('admin:components.group.name')}</label>
        <Paper component="div" className={state.formErrors.name.length > 0 ? styles.redBorder : styles.createInput}>
          <InputBase
            className={styles.input}
            name="name"
            placeholder={t('admin:components.group.enterGroupName')}
            autoComplete="off"
            value={state.name}
            onChange={handleChange}
          />
        </Paper>
        <label>{t('admin:components.group.description')}</label>
        <Paper
          component="div"
          className={state.formErrors.description.length > 0 ? styles.redBorder : styles.createInput}
        >
          <InputBase
            className={styles.input}
            name="description"
            placeholder={t('admin:components.group.enterGroupDescription')}
            autoComplete="off"
            value={state.description}
            onChange={handleChange}
          />
        </Paper>

        <AutoComplete
          data={scopeData}
          label={t('admin:components.group.groupScope')}
          handleChangeScopeType={handleChangeScopeType}
          scopes={state.scopeTypes as any}
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
              closeEditModal(false)
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
