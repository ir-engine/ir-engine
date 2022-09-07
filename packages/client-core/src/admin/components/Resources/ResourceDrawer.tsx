import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@xrengine/editor/src/components/assets/AssetsPreviewPanel'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { ResourceService, useAdminResourceState } from '../../services/ResourceService'
import styles from '../../styles/admin.module.scss'

export enum ResourceDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: ResourceDrawerMode
  selectedResource?: StaticResourceInterface
  onClose: () => void
}

const defaultState = {
  key: '',
  url: '',
  mimeType: '',
  staticResourceType: '',
  formErrors: {
    key: '',
    url: '',
    mimeType: '',
    staticResourceType: ''
  }
}

const ResourceDrawerContent = ({ mode, selectedResource, onClose }: Props) => {
  const { t } = useTranslation()
  const assetsPreviewPanelRef = React.useRef()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const adminResourceState = useAdminResourceState()
  const { user } = useAuthState().value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'static_resource:write')
  const viewMode = mode === ResourceDrawerMode.ViewEdit && !editMode

  const mimeTypesMenu: InputMenuItem[] =
    adminResourceState.value.filters?.mimeTypes.map((el) => {
      return {
        value: el,
        label: el
      }
    }) || []

  const resourceTypesMenu: InputMenuItem[] =
    adminResourceState.value.filters?.staticResourceTypes.map((el) => {
      return {
        value: el,
        label: el
      }
    }) || []

  useEffect(() => {
    loadSelectedResource()
    updateResource()
  }, [selectedResource])

  const loadSelectedResource = () => {
    if (selectedResource) {
      setState({
        ...defaultState,
        key: selectedResource.key || '',
        url: selectedResource.url || '',
        mimeType: selectedResource.mimeType || '',
        staticResourceType: selectedResource.staticResourceType || ''
      })
    }
  }

  const updateResource = async () => {
    if (selectedResource) {
      ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.({
        name: selectedResource.key,
        resourceUrl: selectedResource.url,
        contentType: selectedResource.mimeType
      } as AssetSelectionChangePropsType)
    }
  }

  const handleCancel = () => {
    if (editMode) {
      loadSelectedResource()
      setEditMode(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    setState({ ...defaultState })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'key':
        tempErrors.key = value.length < 2 ? t('admin:components.resources.keyRequired') : ''
        break
      case 'mimeType':
        tempErrors.mimeType = value.length < 1 ? t('admin:components.resources.mimeTypeRequired') : ''
        break
      case 'staticResourceType':
        tempErrors.staticResourceType = value.length < 2 ? t('admin:components.resources.resourceTypeRequired') : ''
        break
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleSubmit = () => {
    const data = {
      key: state.key,
      mimeType: state.mimeType,
      staticResourceType: state.staticResourceType
    }

    let tempErrors = {
      ...state.formErrors,
      key: state.key ? '' : t('admin:components.location.keyCantEmpty'),
      mimeType: state.mimeType ? '' : t('admin:components.location.mimeTypeCantEmpty'),
      staticResourceType: state.staticResourceType ? '' : t('admin:components.location.resourceTypeCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      if (mode === ResourceDrawerMode.Create) {
        ResourceService.createResource(data)
      } else if (selectedResource) {
        ResourceService.patchResource(selectedResource.id, data)
        setEditMode(false)
      }

      handleClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
    }
  }

  return (
    <Container maxWidth="sm" className={styles.mt10}>
      <DialogTitle className={styles.textAlign}>
        {mode === ResourceDrawerMode.Create && t('user:resource.createResource')}
        {mode === ResourceDrawerMode.ViewEdit &&
          editMode &&
          `${t('admin:components.common.update')} ${selectedResource?.key}`}
        {mode === ResourceDrawerMode.ViewEdit && !editMode && selectedResource?.key}
      </DialogTitle>

      <InputText
        name="key"
        label={t('admin:components.resources.key')}
        value={state.key}
        error={state.formErrors.key}
        disabled={viewMode}
        onChange={handleChange}
      />

      <InputSelect
        name="mimeType"
        label={t('admin:components.resources.mimeType')}
        value={state.mimeType}
        error={state.formErrors.mimeType}
        menu={mimeTypesMenu}
        disabled={viewMode}
        onChange={handleChange}
      />

      <InputSelect
        name="staticResourceType"
        label={t('admin:components.resources.resourceType')}
        value={state.staticResourceType}
        error={state.formErrors.staticResourceType}
        menu={resourceTypesMenu}
        disabled={viewMode}
        onChange={handleChange}
      />

      <Typography>{t('admin:components.resources.preview')}</Typography>

      <Box sx={{ height: 300 }}>
        <AssetsPreviewPanel hideHeading ref={assetsPreviewPanelRef} />
      </Box>

      <DialogActions>
        <Button className={styles.outlinedButton} onClick={handleCancel}>
          {t('admin:components.common.cancel')}
        </Button>
        {(mode === ResourceDrawerMode.Create || editMode) && (
          <Button className={styles.gradientButton} onClick={handleSubmit}>
            {t('admin:components.common.submit')}
          </Button>
        )}
        {mode === ResourceDrawerMode.ViewEdit && !editMode && (
          <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => setEditMode(true)}>
            {t('admin:components.common.edit')}
          </Button>
        )}
      </DialogActions>
    </Container>
  )
}

const ResourceDrawer = (props: Props) => {
  const { open, onClose } = props
  return (
    <DrawerView open={open} onClose={onClose}>
      <ResourceDrawerContent {...props} />
    </DrawerView>
  )
}

export default ResourceDrawer
