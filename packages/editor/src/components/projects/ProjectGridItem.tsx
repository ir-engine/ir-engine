import React from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { deleteScene, renameScene } from '../../functions/sceneFunctions'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import StylableContextMenuTrigger from './StylableContextMenuTrigger'
import { useDispatch } from '@xrengine/client-core/src/store'
import { EditorAction } from '../../services/EditorServices'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import { useStyle } from './style'

/**
 *
 * @author Robert Long
 * @param {any} project
 * @returns
 */
function collectMenuProps({ project }) {
  return { project }
}

/**
 *
 * @author Robert Long
 */
const StyledProjectGridItem = styled.div`
  display: flex;
  flex-direction: column;
  height: 200px;
  border-radius: 6px;
  background-color: ${(props) => props.theme.toolbar};
  text-decoration: none;
  border: 1px solid transparent;

  &:hover {
    color: white;
    border-color: white;
  }
`

/**
 *
 * @author Robert Long
 */
const StyledContextMenuTrigger = styled(StylableContextMenuTrigger)`
  display: flex;
  flex-direction: column;
  flex: 1;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
`

/**
 *
 * @author Robert Long
 */
const TitleContainer = styled.div`
  display: flex;
  height: 50px;
  align-items: center;
  padding: 0 16px;

  h3 {
    font-size: 16px;
  }

  button {
    margin-left: auto;

    svg {
      width: 1em;
      height: 1em;
    }
  }
`

/**
 *
 * @author Robert Long
 */
const ThumbnailContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: stretch;
  background-color: ${(props) => props.theme.panel};
  overflow: hidden;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
`

/**
 *
 * @author Robert Long
 */
const Thumbnail = styled.div<{ src: string }>`
  display: flex;
  flex: 1;
  background-size: cover;
  background-position: 50%;
  background-repeat: no-repeat;
  background-image: url(${(props) => props.src});
`

/**
 *
 * @author Robert Long
 */
const Col = styled.div`
  display: flex;
  flex-direction: column;

  p {
    color: ${(props) => props.theme.text2};
  }
`
type Props = {
  onClickExisting: any
  contextMenuId: any
  project: any
  projectName?: any
}

/**
 *
 * @author Robert Long
 */
export const ProjectGridItem = (props: Props) => {
  const { onClickExisting, contextMenuId, project, projectName } = props
  const classes = useStyle()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const dispatch = useDispatch()
  const history = useHistory()
  const [warningModelOpen, setWarningModelOpen] = React.useState(false)
  const [sceneTodelete, setSceneToDelete] = React.useState('')
  const [oldSceneName, setOldSceneName] = React.useState('')
  const [newSceneName, setNewSceneName] = React.useState('')

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChange = (e) => {
    setNewSceneName(e.target.value)
  }

  const handleOnRename = (project) => {
    handleClose()
    setOldSceneName(project)
    setNewSceneName(project)
  }

  const handleOnDelete = async () => {
    await deleteScene(projectName, sceneTodelete)
    setSceneToDelete('')
    dispatch(EditorAction.sceneLoaded(null))
    history.push(`/editor/${projectName}`)
  }

  const content = (
    <>
      <ThumbnailContainer>
        {(project.thumbnailUrl || project.thumbnail) && <Thumbnail src={project.thumbnailUrl ?? project.thumbnail} />}
      </ThumbnailContainer>
      <TitleContainer>
        <Col>
          {oldSceneName.length == 0 ? (
            <h3>{project.name.replaceAll('-', ' ')}</h3>
          ) : (
            <Paper component="div" className={classes.inputContainer}>
              <InputBase
                className={classes.input}
                name="name"
                style={{ color: '#fff' }}
                autoComplete="off"
                value={newSceneName}
                onClick={(e) => {
                  e.stopPropagation()
                }}
                onChange={(e) => handleChange(e)}
                onKeyPress={async (e) => {
                  if (e.key == 'Enter') {
                    await renameScene(projectName, newSceneName, oldSceneName)
                    dispatch(EditorAction.sceneLoaded(newSceneName))
                    history.push(`/editor/${projectName}`)
                  }
                }}
              />
            </Paper>
          )}
        </Col>
        <IconButton
          aria-label="more"
          id="button"
          aria-controls={open ? 'menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon style={{ color: '#f1f1f1' }} />
        </IconButton>
      </TitleContainer>
    </>
  )

  if (contextMenuId) {
    return (
      <>
        <StyledProjectGridItem as="a" onClick={() => onClickExisting(project)}>
          <StyledContextMenuTrigger id={contextMenuId} project={project} collect={collectMenuProps} holdToDisplay={-1}>
            {content}
          </StyledContextMenuTrigger>
        </StyledProjectGridItem>
        <Menu
          id="menu"
          MenuListProps={{
            'aria-labelledby': 'long-button'
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          classes={{ paper: classes.rootMenu }}
        >
          <MenuItem classes={{ root: classes.itemRoot }} onClick={() => handleOnRename(project.name)}>
            {t('editor:hierarchy.lbl-rename')}
          </MenuItem>
          <MenuItem
            classes={{ root: classes.itemRoot }}
            onClick={() => {
              setWarningModelOpen(true), setSceneToDelete(project.name), handleClose()
            }}
          >
            {t('editor:hierarchy.lbl-delete')}
          </MenuItem>
        </Menu>
        <Dialog
          open={warningModelOpen}
          onClose={() => setWarningModelOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          classes={{ paper: classes.paperDialog }}
        >
          <DialogTitle id="alert-dialog-title">Are sure you want to delete this scene?</DialogTitle>
          <DialogActions>
            <Button
              onClick={() => {
                setWarningModelOpen(false), setSceneToDelete('')
              }}
              className={classes.spanNone}
            >
              Cancel
            </Button>
            <Button
              className={classes.spanDange}
              onClick={async () => {
                handleOnDelete()
                setWarningModelOpen(false)
              }}
              autoFocus
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  } else {
    return (
      <StyledProjectGridItem as="a" onClick={() => onClickExisting(project)}>
        {content}
      </StyledProjectGridItem>
    )
  }
}

export default ProjectGridItem
