import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MAX_AVATAR_FILE_SIZE, MIN_AVATAR_FILE_SIZE } from '@xrengine/common/src/constants/AvatarConstants'
import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@xrengine/editor/src/components/assets/AssetsPreviewPanel'

import FileUploadIcon from '@mui/icons-material/FileUpload'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputRadio from '../../common/InputRadio'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { ResourceService, useAdminResourceState } from '../../services/ResourceService'
import styles from '../../styles/admin.module.scss'

const Input = styled('input')({
  display: 'none'
})

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
  name: '',
  mimeType: '',
  staticResourceType: '',
  source: 'file',
  resourceUrl: '',
  resourceFile: undefined as File | undefined,
  formErrors: {
    name: '',
    staticResourceType: '',
    resourceUrl: '',
    resourceFile: ''
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

  const resourceTypesMenu: InputMenuItem[] =
    adminResourceState.value.filters?.allStaticResourceTypes.map((el) => {
      return {
        value: el,
        label: el
      }
    }) || []

  useEffect(() => {
    loadSelectedResource()
  }, [selectedResource])

  useEffect(() => {
    updateResource()
  }, [state.source, state.resourceFile, state.resourceUrl])

  const loadSelectedResource = () => {
    if (selectedResource) {
      setState({
        ...defaultState,
        key: selectedResource.key || '',
        mimeType: selectedResource.mimeType || '',
        staticResourceType: selectedResource.staticResourceType || '',
        source: 'url',
        resourceUrl: selectedResource.url || '',
        resourceFile: undefined
      })
    }
  }

  const updateResource = async () => {
    let url = ''
    if (state.source === 'url' && state.resourceUrl) {
      url = isValidHttpUrl(state.resourceUrl) ? state.resourceUrl : ''
    } else if (state.source === 'file' && state.resourceFile) {
      await state.resourceFile.arrayBuffer()
      url = URL.createObjectURL(state.resourceFile) + '#' + state.resourceFile.name
    }

    if (url) {
      ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.({
        name: state.key,
        resourceUrl: url,
        contentType: state.mimeType
      } as AssetSelectionChangePropsType)
    } else {
      ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.({ resourceUrl: '', name: '', contentType: '' })
    }
  }

  const isValidHttpUrl = (urlString) => {
    let url

    try {
      url = new URL(urlString)
    } catch (_) {
      return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
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

  const handleChangeFile = (e) => {
    const { name, files } = e.target

    if (files.length === 0) {
      return
    }

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'resourceFile': {
        const inValidSize = files[0].size < MIN_AVATAR_FILE_SIZE || files[0].size > MAX_AVATAR_FILE_SIZE
        tempErrors.resourceFile = inValidSize
          ? t('admin:components.resources.resourceFileOversized', {
              minSize: MIN_AVATAR_FILE_SIZE / 1048576,
              maxSize: MAX_AVATAR_FILE_SIZE / 1048576
            })
          : ''
        break
      }
      default:
        break
    }

    const newState = { ...state, [name]: files[0], formErrors: tempErrors }
    if (!tempErrors.resourceFile) {
      newState.mimeType = files[0].type

      if (!state.key) {
        newState.key = files[0].name
      }
    }
    setState(newState)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'name':
        tempErrors.name = value.length < 2 ? t('admin:components.resources.nameRequired') : ''
        break
      case 'staticResourceType':
        tempErrors.staticResourceType = value.length < 2 ? t('admin:components.resources.resourceTypeRequired') : ''
        break
      case 'resourceUrl': {
        tempErrors.resourceUrl = !isValidHttpUrl(value) ? t('admin:components.resources.resourceUrlInvalid') : ''
        break
      }
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleSubmit = async () => {
    let resourceBlob: Blob | undefined = undefined

    let tempErrors = {
      ...state.formErrors,
      name: '',
      staticResourceType: state.staticResourceType ? '' : t('admin:components.resources.resourceTypeCantEmpty'),
      resourceUrl:
        state.source === 'url' && state.resourceUrl ? '' : t('admin:components.resources.resourceUrlCantEmpty'),
      resourceFile:
        state.source === 'file' && state.resourceFile ? '' : t('admin:components.resources.resourceFileCantEmpty')
    }

    if (mode === ResourceDrawerMode.Create) {
      tempErrors.name = state.name ? '' : t('admin:components.resources.nameCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if ((state.source === 'file' && tempErrors.resourceFile) || (state.source === 'url' && tempErrors.resourceUrl)) {
      NotificationService.dispatchNotify(t('admin:components.common.fixErrorFields'), { variant: 'error' })
      return
    } else if (tempErrors.name || tempErrors.staticResourceType) {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
      return
    } else if (state.source === 'file' && state.resourceFile) {
      resourceBlob = state.resourceFile
    } else if (state.source === 'url' && state.resourceUrl) {
      const resourceData = await fetch(state.resourceUrl)
      resourceBlob = await resourceData.blob()

      if (selectedResource && selectedResource.url === state.resourceUrl) {
        resourceBlob = new Blob([resourceBlob], { type: selectedResource.mimeType })
      }
    }

    const data = {
      id: selectedResource ? selectedResource.id : '',
      key: mode === ResourceDrawerMode.Create ? state.name : state.key,
      staticResourceType: state.staticResourceType
    }

    if (resourceBlob) {
      ResourceService.createOrUpdateResource(data, resourceBlob)

      if (mode === ResourceDrawerMode.ViewEdit) {
        setEditMode(false)
      }

      handleClose()
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

      {mode === ResourceDrawerMode.Create && (
        <InputText
          name="name"
          label={t('admin:components.resources.name')}
          value={state.name}
          error={state.formErrors.name}
          onChange={handleChange}
        />
      )}

      {mode !== ResourceDrawerMode.Create && (
        <InputText name="key" label={t('admin:components.resources.key')} value={state.key} disabled />
      )}

      <InputText name="mimeType" label={t('admin:components.resources.mimeType')} value={state.mimeType} disabled />

      <InputSelect
        name="staticResourceType"
        label={t('admin:components.resources.resourceType')}
        value={state.staticResourceType}
        error={state.formErrors.staticResourceType}
        menu={resourceTypesMenu}
        disabled={viewMode}
        onChange={handleChange}
      />

      {!viewMode && (
        <InputRadio
          name="source"
          label={t('admin:components.avatar.source')}
          value={state.source}
          options={[
            { value: 'file', label: t('admin:components.avatar.file') },
            { value: 'url', label: t('admin:components.avatar.url') }
          ]}
          onChange={handleChange}
        />
      )}

      {state.source === 'file' && (
        <>
          <label htmlFor="select-file">
            <Input id="select-file" name="resourceFile" type="file" onChange={handleChangeFile} />
            <Button className={styles.gradientButton} component="span" startIcon={<FileUploadIcon />}>
              {t('admin:components.resources.selectFile')}
            </Button>
          </label>

          {state.formErrors.resourceFile && (
            <Box>
              <FormControl error>
                <FormHelperText className="Mui-error">{state.formErrors.resourceFile}</FormHelperText>
              </FormControl>
            </Box>
          )}
        </>
      )}

      {state.source === 'url' && (
        <InputText
          name="resourceUrl"
          sx={{ mt: 3, mb: 1 }}
          label={t('admin:components.resources.resourceUrl')}
          value={state.resourceUrl}
          error={state.formErrors.resourceUrl}
          disabled={viewMode}
          onChange={handleChange}
        />
      )}

      <Typography>{t('admin:components.resources.preview')}</Typography>

      <Box className={styles.preview} sx={{ height: 300 }}>
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
