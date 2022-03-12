import React from 'react'
import { useTranslation } from 'react-i18next'

import { SceneData, SceneMetadata } from '@xrengine/common/src/interfaces/SceneInterface'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModel from '../../common/ConfirmModel'
import TableComponent from '../../common/Table'
import { sceneColumns, SceneProps, SceneViewModel } from '../../common/variables/scene'
import { SCENE_PAGE_LIMIT, SceneService, useSceneState } from '../../services/SceneService'
import { useStyles } from '../../styles/ui'
import ViewScene from './ViewScene'

const SceneTable = (props: SceneProps) => {
  const classes = useStyles()
  const authState = useAuthState()
  const user = authState.user
  const { t } = useTranslation()
  const scene = useSceneState()
  const sceneData = scene?.scenes
  const sceneCount = scene?.total
  const [singleScene, setSingleScene] = React.useState<SceneMetadata>(null!)
  const [open, setOpen] = React.useState(false)
  const [sceneName, setSceneName] = React.useState<string | JSX.Element>('')
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [sceneId, setSceneId] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(SCENE_PAGE_LIMIT)

  React.useEffect(() => {
    if (user.id.value && scene.updateNeeded.value) {
      SceneService.fetchAdminScenes()
    }
  }, [user, scene.updateNeeded.value])

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    SceneService.fetchAdminScenes(incDec)
    setPage(newPage)
  }
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleClose = (open: boolean) => {
    setOpen(open)
  }

  const handleViewScene = (id: string) => {
    const scene = sceneData?.value.find((sc) => sc.id === id)
    if (scene !== undefined) {
      setSingleScene(scene)
      setOpen(true)
    }
  }

  const handleCloseModel = () => {
    setPopConfirmOpen(false)
  }

  const submitRemoveLocation = async () => {
    await SceneService.deleteScene(sceneId)
    setPopConfirmOpen(false)
  }

  const createData = (
    id: string,
    name: string | JSX.Element,
    type: string | JSX.Element,
    description: string | JSX.Element,
    entity: number | JSX.Element,
    version: string | JSX.Element
  ): SceneViewModel => {
    return {
      id,
      name,
      description,
      type,
      entity,
      version,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanWhite} onClick={() => handleViewScene(id)}>
              {t('admin:components.index.view')}
            </span>
          </a>
          <a
            href="#h"
            className={classes.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setSceneId(id)
              setSceneName(name)
            }}
          >
            <span className={classes.spanDange}>{t('admin:components.index.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = sceneData?.value.map((el) => {
    return createData(
      el.id!,
      el.name || <span className={classes.spanNone}>{t('admin:components.index.none')}</span>,
      el.type || <span className={classes.spanNone}>{t('admin:components.index.none')}</span>,
      el.description || <span className={classes.spanNone}>{t('admin:components.index.none')}</span>,
      el.entities?.length || <span className={classes.spanNone}>{t('admin:components.index.none')}</span>,
      el.version || <span className={classes.spanNone}>{t('admin:components.index.none')}</span>
    )
  })

  return (
    <React.Fragment>
      <TableComponent
        rows={rows}
        column={sceneColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={sceneCount?.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModel
        popConfirmOpen={popConfirmOpen}
        handleCloseModel={handleCloseModel}
        submit={submitRemoveLocation}
        name={sceneName}
        label={'scene'}
      />
      {singleScene && <ViewScene adminScene={singleScene} viewModal={open} closeViewModal={handleClose} />}
    </React.Fragment>
  )
}

export default SceneTable
