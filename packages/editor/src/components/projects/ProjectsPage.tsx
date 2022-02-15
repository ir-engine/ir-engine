import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  InputBase,
  Menu,
  Paper,
  MenuItem
} from '@mui/material'
import { ArrowRightRounded, Clear, FilterList, Search, ManageAccounts, Check } from '@mui/icons-material'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { ProjectService } from '@xrengine/client-core/src/common/services/ProjectService'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { Button, MediumButton } from '../inputs/Button'
import { connectMenu, ContextMenu } from '../layout/ContextMenu'
import { ErrorMessage } from './ProjectGrid'
import templates from './templates'
import { getProjects } from '../../functions/projectFunctions'
import { CreateProjectModal } from './CreateProjectModal'
import { EditorAction } from '../../services/EditorServices'
import styles from './styles.module.scss'

const contextMenuId = 'project-menu'

const OfficialProjectData = [
  {
    id: '1570ae11-889a-11ec-886e-b126f7590685',
    name: 'Maps',
    repositoryPath: '',
    storageProviderPath: 'https://localhost:8642/projects/default-project/',
    thumbnail: '/static/xrengine_thumbnail.jpg',
    description: 'Procedurally generated map tiles using geojson data with mapbox and turf.js'
  },
  {
    id: '1570ae12-889a-11ec-886e-b126f7590685',
    name: 'Inventory',
    repositoryPath: '',
    storageProviderPath: 'https://localhost:8642/projects/default-project/',
    thumbnail: '/static/xrengine_thumbnail.jpg',
    description:
      'Item inventory, trade & cirtual currency. Allow your users to use a database, IPFS, DID or blockchain backed item storage for equippables, wearables and tradeable items.'
  },
  {
    id: '1570ae13-889a-11ec-886e-b126f7590685',
    name: 'e-commerce',
    repositoryPath: '',
    storageProviderPath: 'https://localhost:8642/projects/default-project/',
    thumbnail: '/static/xrengine_thumbnail.jpg',
    description:
      'Join the digital economy with 3D storefronts full of perchasable items from Shopify, Wucommerce and more!'
  },
  {
    id: '1570ae14-889a-11ec-886e-b126f7590685',
    name: 'Digital Beings',
    repositoryPath: '',
    storageProviderPath: 'https://localhost:8642/projects/default-project/',
    thumbnail: '/static/xrengine_thumbnail.jpg',
    description: 'Enchance your virtual worlds with GPT-3 backed AI agents!'
  },
  {
    id: '1570ae15-889a-11ec-886e-b126f7590685',
    name: 'harmony',
    repositoryPath: '',
    storageProviderPath: 'https://localhost:8642/projects/default-project/',
    thumbnail: '/static/xrengine_thumbnail.jpg',
    description:
      'An elegant and minimalist messenger client with group text, audio, video and screensharing capabilities.'
  }
]

const CommunityProjectData = [
  {
    id: '1570ae16-889a-11ec-886e-b126f7590685',
    name: 'puttclub',
    repositoryPath: '',
    storageProviderPath: 'https://localhost:8642/projects/default-project/',
    thumbnail: '/static/xrengine_thumbnail.jpg',
    description: 'Mini-golf in WebXR!'
  }
]

const ProjectExpansionList = (props: React.PropsWithChildren<{ id: string; summary: string }>) => {
  return (
    <Accordion classes={{ root: styles.expansionList }} disableGutters defaultExpanded>
      <AccordionSummary
        id={props.id}
        classes={{
          root: styles.expansionSummary,
          content: styles.expansionSummaryContent,
          expanded: styles.expansionSummaryExpanded
        }}
      >
        <IconButton aria-label="menu" disableRipple>
          <ArrowRightRounded />
        </IconButton>
        <h3>{props.summary}</h3>
      </AccordionSummary>
      <AccordionDetails classes={{ root: styles.expansionDetail }}>{props.children}</AccordionDetails>
    </Accordion>
  )
}

const ProjectList = (props: React.PropsWithChildren<{ projects: ProjectInterface[]; onClick: Function }>) => {
  if (!props.projects || props.projects.length <= 0) return <></>

  return (
    <ul className={styles.listContainer}>
      {props.projects.map((project, index) => (
        <li className={styles.itemContainer} key={index}>
          <div className={styles.thumbnailContainer} style={{ backgroundImage: `url(${project.thumbnail})` }}></div>
          <div className={styles.headerConatiner}>
            <h3 className={styles.header}>{project.name.replaceAll('-', ' ')}</h3>
            <IconButton disableRipple>
              <ManageAccounts />
            </IconButton>
          </div>
          {project.description && <p className={styles.description}>{project.description}</p>}
        </li>
      ))}
    </ul>
  )
}

const ProjectsPage = (props) => {
  const [installedProjects, setInstalledProjects] = useState<ProjectInterface[]>([]) // constant projects initialized with an empty array.
  const [officialProjects, setOfficialProjects] = useState<ProjectInterface[]>([])
  const [communityProjects, setCommunityProjects] = useState<ProjectInterface[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [filter, setFilter] = useState({ installed: false, official: true, community: true })
  const [createProjectsModalOpen, setCreateProjectsModalOpen] = useState(false)

  const unmounted = useRef(false)
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useHistory()

  const fetchItems = async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      if (unmounted.current) return

      setInstalledProjects(data ?? [])
    } catch (error) {
      if (unmounted.current) return

      console.error(error)
      setError(error)
    }
    setLoading(false)
  }

  const fetchOfficialProjects = async (query?: string) => {
    setLoading(true)
    try {
      const data = await (query
        ? OfficialProjectData.filter((p) => p.name.includes(query) || p.description.includes(query))
        : OfficialProjectData)
      if (unmounted.current) return

      setOfficialProjects(data ?? [])
    } catch (error) {
      if (unmounted.current) return

      console.error(error)
      setError(error)
    }
    setLoading(false)
  }

  const fetchCommunityProjects = async (query?: string) => {
    setLoading(true)
    try {
      const data = await (query
        ? CommunityProjectData.filter((p) => p.name.includes(query) || p.description.includes(query))
        : CommunityProjectData)
      if (unmounted.current) return

      setCommunityProjects(data ?? [])
    } catch (error) {
      if (unmounted.current) return

      console.error(error)
      setError(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (authUser?.accessToken.value != null && authUser.accessToken.value.length > 0 && user?.id.value != null) {
      fetchItems()
      fetchOfficialProjects()
      fetchCommunityProjects()
    }

    return () => {
      unmounted.current = true
    }
  }, [authUser.accessToken.value])

  useEffect(() => {
    const locationSceneName = props?.match?.params?.sceneName
    const locationProjectName = props?.match?.params?.projectName

    locationProjectName && dispatch(EditorAction.projectLoaded(locationProjectName))
    locationSceneName && dispatch(EditorAction.sceneLoaded(locationSceneName))
  }, [])

  /**
   *function to delete project
   */
  const onDeleteScene = async (scene) => {
    try {
      // TODO
    } catch (error) {
      console.log(`Error deleting scene ${error}`)
    }
  }

  const openTutorial = () => {}

  /**
   *function to adding a route to the router object.
   */
  const onClickNew = () => {
    setCreateProjectsModalOpen(true)
  }

  const onClickExisting = (project) => {
    dispatch(EditorAction.sceneLoaded(null))
    dispatch(EditorAction.projectLoaded(project.name))
    history.push(`/editor/${project.name}`)
  }

  const onCreateProject = async (name) => {
    console.log('onCreateProject', name)
    await ProjectService.createProject(name)
    fetchItems()
  }

  /**
   *function to render the ContextMenu component with MenuItem component delete.
   */
  const renderContextMenu = (props) => {
    return (
      <>
        <ContextMenu id={contextMenuId}>
          <MenuItem onClick={(e) => onDeleteScene(props.trigger.scene)}>
            {t('editor.projects.contextMenu.deleteProject')}
          </MenuItem>
        </ContextMenu>
      </>
    )
  }

  const handleSerach = (e) => {
    setQuery(e.target.value)

    if (filter.installed) {
    }

    if (filter.official) fetchOfficialProjects(e.target.value)

    if (filter.community) fetchCommunityProjects(e.target.value)
  }

  const clearSearch = () => {
    setQuery('')
  }
  const openFilterMenu = (e) => setAnchorEl(e.target)
  const handleClose = () => setAnchorEl(null)
  const toggleFilter = (type: string) => setFilter({ ...filter, [type]: !filter[type] })

  /**
   *Calling a functional component connectMenu for creating ProjectContextMenu.
   *
   */
  const ProjectContextMenu = connectMenu(contextMenuId)(renderContextMenu)

  // Declaring an array
  const topTemplates = [] as any[]

  // Adding first four templates of tamplates array to topTemplate array.
  for (let i = 0; i < templates.length && i < 4; i++) {
    topTemplates.push(templates[i])
  }

  /**
   * Rendering view for projects page, if user is not login yet then showing login view.
   * if user is loged in and has no existing projects then we showing welcome view, providing link for the tutorials.
   * if user has existing projects then we show the existing projects in grids and a grid to add new project.
   *
   */
  if (!authUser?.accessToken.value || authUser.accessToken.value.length === 0 || !user?.id.value) return <></>

  return (
    <main>
      <div className={styles.projectPageContainer}>
        <div className={styles.projectGridContainer}>
          <div className={styles.projectGridHeader}>
            <h2>{t(`editor.projects.title`)}</h2>
            <Paper component="form" classes={{ root: styles.searchInputRoot }}>
              <IconButton aria-label="menu" disableRipple onClick={openFilterMenu}>
                <FilterList />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{ paper: styles.filterMenu }}
              >
                <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => toggleFilter('installed')}>
                  {filter.installed && <Check />}
                  {t(`editor.projects.installed`)}
                </MenuItem>
                <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => toggleFilter('official')}>
                  {filter.official && <Check />}
                  {t(`editor.projects.official`)}
                </MenuItem>
                <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => toggleFilter('community')}>
                  {filter.community && <Check />}
                  {t(`editor.projects.community`)}
                </MenuItem>
              </Menu>
              <InputBase
                value={query}
                classes={{ root: styles.inputRoot }}
                placeholder={t(`editor.projects.lbl-searchProject`)}
                inputProps={{ 'aria-label': t(`editor.projects.lbl-searchProject`) }}
                onChange={handleSerach}
              />
              {query ? (
                <IconButton aria-label="search" disableRipple onClick={clearSearch}>
                  <Clear />
                </IconButton>
              ) : (
                <IconButton aria-label="search" disableRipple>
                  <Search />
                </IconButton>
              )}
            </Paper>
            <Button onClick={onClickNew} className={styles.btn}>
              {t(`editor.projects.lbl-createProject`)}
            </Button>
          </div>
          <div className={styles.projectGrid}>
            {error && <ErrorMessage>{(error as any).message}</ErrorMessage>}
            {(filter.installed || !query) && (
              <ProjectExpansionList
                id={t(`editor.projects.installed`)}
                summary={`${t('editor.projects.installed')} (${installedProjects.length})`}
              >
                <ProjectList projects={installedProjects} onClick={onClickExisting} />
              </ProjectExpansionList>
            )}
            {query && filter.official && officialProjects.length > 0 && (
              <ProjectExpansionList
                id={t(`editor.projects.official`)}
                summary={`${t('editor.projects.official')} (${officialProjects.length})`}
              >
                <ProjectList projects={officialProjects} onClick={onClickExisting} />
              </ProjectExpansionList>
            )}
            {query && filter.community && communityProjects.length > 0 && (
              <ProjectExpansionList
                id={t(`editor.projects.community`)}
                summary={`${t('editor.projects.community')} (${communityProjects.length})`}
              >
                <ProjectList projects={communityProjects} onClick={onClickExisting} />
              </ProjectExpansionList>
            )}
          </div>
        </div>
        {installedProjects.length < 2 && !loading ? (
          <div className={styles.welcomeContainer}>
            <h1>{t('editor.projects.welcomeMsg')}</h1>
            <h2>{t('editor.projects.description')}</h2>
            <MediumButton onClick={openTutorial}>{t('editor.projects.lbl-startTutorial')}</MediumButton>
          </div>
        ) : null}
      </div>
      <ProjectContextMenu />
      <CreateProjectModal
        createProject={onCreateProject}
        open={createProjectsModalOpen}
        handleClose={() => setCreateProjectsModalOpen(false)}
      />
    </main>
  )
}

export default ProjectsPage
