import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Button, Grid, Paper, Typography } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'

import { useAuthState } from '../../../user/services/AuthService'
import { ServerSettingService, useServerSettingState } from '../../services/Setting/ServerSettingService'
import styles from '../../styles/settings.module.scss'

interface serverProps {}

const Server = (props: serverProps) => {
  const [open, setOpen] = useState(false)
  const [openPaginate, setOpenPginate] = useState(false)
  const serverSettingState = useServerSettingState()
  const [serverSetting] = serverSettingState?.server?.value || []
  const id = serverSetting?.id
  const [gaTrackingId, setGaTrackingId] = useState(serverSetting?.gaTrackingId)
  const [gitPem, setGitPem] = useState(serverSetting?.gitPem)
  const { t } = useTranslation()

  useEffect(() => {
    if (serverSetting) {
      setGaTrackingId(serverSetting?.gaTrackingId)
      setGitPem(serverSetting?.gitPem)
    }
  }, [serverSettingState?.updateNeeded?.value])

  const [dryRun, setDryRun] = useState({
    checkedA: true,
    checkedB: true
  })
  const [local, setLocal] = useState({
    checkedA: true,
    checkedB: true
  })

  const authState = useAuthState()
  const user = authState.user
  const handleClick = () => {
    setOpen(!open)
  }
  const handleClickPaginate = () => {
    setOpenPginate(!openPaginate)
  }

  const handleDryRun = (event) => {
    setDryRun({ ...dryRun, [event.target.name]: event.target.checked })
  }

  const handleLocal = (event) => {
    setLocal({ ...local, [event.target.name]: event.target.checked })
  }

  const handleSave = (event) => {
    event.preventDefault()
    ServerSettingService.patchServerSetting({ gaTrackingId: gaTrackingId, gitPem: gitPem }, id)
  }

  const handleCancel = () => {
    setGaTrackingId(serverSetting?.gaTrackingId)
    setGitPem(serverSetting?.gitPem)
  }

  useEffect(() => {
    if (user?.id?.value != null && serverSettingState?.updateNeeded?.value === true) {
      ServerSettingService.fetchServerSettings()
    }
  }, [authState?.user?.id?.value, serverSettingState?.updateNeeded?.value])

  return (
    <form onSubmit={handleSave}>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.server')}
      </Typography>
      <Grid container spacing={3} key={serverSetting?.id || ''}>
        <Grid item xs={12} sm={6}>
          <br />
          <label>{t('admin:components.setting.mode')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="mode" className={styles.input} disabled value={serverSetting?.mode || 'test'} />
          </Paper>
          <label> {t('admin:components.setting.hostName')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="hostname" className={styles.input} disabled value={serverSetting?.hostname || 'test'} />
          </Paper>
          <label>{t('admin:components.setting.port')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="port" className={styles.input} value={serverSetting?.port || ''} disabled />
          </Paper>
          <label> {t('admin:components.setting.clientHost')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="clienthost" className={styles.input} disabled value={serverSetting?.clientHost || ''} />
          </Paper>
          <label>{t('admin:components.setting.rootDirectory')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="rootDir" className={styles.input} disabled value={serverSetting?.rootDir || ''} />
          </Paper>
          <label>{t('admin:components.setting.publicDirectory')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="publicDir" className={styles.input} disabled value={serverSetting?.publicDir || ''} />
          </Paper>
          <label>{t('admin:components.setting.nodeModulesDirectory')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase
              name="nodeModule"
              className={styles.input}
              disabled
              value={serverSetting?.nodeModulesDir || ''}
            />
          </Paper>{' '}
          <label>{t('admin:components.setting.localStorageProvider')} </label>
          <Paper component="div" className={styles.createInput}>
            <InputBase
              name="localStorageProvider"
              className={styles.input}
              disabled
              value={serverSetting?.localStorageProvider || ''}
            />
          </Paper>
          <label> {t('admin:components.setting.performDryRun')}</label>
          <Paper component="div" className={styles.createInput}>
            <Switch
              disabled
              checked={dryRun.checkedB}
              onChange={handleDryRun}
              color="primary"
              name="checkedB"
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <label>{t('admin:components.setting.storageProvider')} </label>
          <Paper component="div" className={styles.createInput}>
            <InputBase
              name="StorageProvider"
              className={styles.input}
              disabled
              value={serverSetting?.storageProvider || ''}
            />
          </Paper>
          <label>{t('admin:components.setting.googleAnalyticsTrackingId')} </label>
          <Paper component="div" className={styles.createInput}>
            <IconButton size="large">
              <Icon icon="emojione:key" />
            </IconButton>
            <InputBase
              name="googleTrackingid"
              className={styles.input}
              value={gaTrackingId || ''}
              onChange={(e) => setGaTrackingId(e.target.value)}
            />
          </Paper>
          <ListItem button onClick={handleClick}>
            <ListItemText primary="Hub" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button className={styles.nested}>
                <Paper component="div" className={styles.createInput}>
                  <InputBase name="hub" className={styles.input} disabled value={serverSetting?.hub?.endpoint || ''} />
                </Paper>
              </ListItem>
            </List>
          </Collapse>
          <ListItem button onClick={handleClickPaginate}>
            <ListItemText primary="Paginate" />
            {openPaginate ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openPaginate} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button className={styles.nested}>
                <ListItemText primary="Default:10" />
                <ListItemText primary={`Max: ${serverSetting?.paginate || ''}`} />
              </ListItem>
            </List>
          </Collapse>
          <label>{t('admin:components.setting.url')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="url" className={styles.input} disabled value={serverSetting?.url || ''} />
          </Paper>
          <label> {t('admin:components.setting.certPath')} </label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="certPath" className={styles.input} disabled value={serverSetting?.certPath || ''} />
          </Paper>
          <label> {t('admin:components.setting.keyPath')} </label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="keyPath" className={styles.input} disabled value={serverSetting?.keyPath || ''} />
          </Paper>
          <label> {t('admin:components.setting.githubPrivateKey')} </label>
          <Paper component="div" className={styles.createInput}>
            <InputBase
              name="GithubPrivateKey"
              className={styles.input}
              value={gitPem || ''}
              onChange={(e) => setGitPem(e.target.value)}
            />
          </Paper>
          <label> {t('admin:components.setting.local')} </label>
          <Paper component="div" className={styles.createInput}>
            <Switch
              disabled
              checked={local.checkedB}
              onChange={handleLocal}
              color="primary"
              name="checkedB"
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          </Paper>
          <label> {t('admin:components.setting.releaseName')} </label>
          <Paper component="div" className={styles.createInput}>
            <InputBase name="releaseName" className={styles.input} disabled value={serverSetting?.releaseName || ''} />
          </Paper>
        </Grid>
      </Grid>
      <Button sx={{ maxWidth: '100%' }} variant="outlined" className={styles.cancelButton} onClick={handleCancel}>
        {t('admin:components.setting.cancel')}
      </Button>
      &nbsp; &nbsp;
      <Button sx={{ maxWidth: '100%' }} variant="contained" className={styles.saveBtn} type="submit">
        {t('admin:components.setting.save')}
      </Button>
    </form>
  )
}

export default Server
