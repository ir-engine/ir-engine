import React, { useEffect, useState, useReducer, useRef } from 'react'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import styles from './AddFilesForm.module.scss'
import { Button, CardMedia, TextField, Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import AppHeader from '../Header'
import { bindActionCreators, Dispatch } from 'redux'
import { FeedService } from '../../reducers/post/FeedService'

interface Props {
  filesTarget?: any
  setFilesTarget?: any
  setAddFilesView?: any
}

const descriptionState = new Map()

const descriptionReducer = (state, action) => {
  const { name, value } = action.payload
  switch (action.type) {
    case 'CHANGE_TEXT':
      state.set(name, value)
      return new Map(state.entries())
      break
    case 'DELETE_ITEM':
      state.delete(name)
      return new Map(state.entries())
      break

    default:
      return state
      break
  }
}

const getTitleAndDescription = (str) => {
  str = str.trim()
  let [title, description] = str.split('\n')
  let result = {
    title: title,
    description: str.length > 80 ? str : ''
  }

  if (title.length < 80 && !!description) {
    result.description = description
  }

  let index = -1
  while ((index = result.title.lastIndexOf(' ')) !== -1) {
    if (result.title.length <= 80) {
      break
    } else {
      result.title = result.title.slice(0, index)
    }
  }

  return result
}

const AddFilesForm = ({ filesTarget, setAddFilesView, setFilesTarget }: Props) => {
  const [descrText, setDescrText] = useState('')
  const [descriptions, dispatch] = useReducer(descriptionReducer, descriptionState)
  const [titleFile, setTitleFile] = useState('')
  const [preview, setPreview] = useState(null)
  const [video, setVideo] = useState(null)
  const inputFileRef = useRef(null)

  // const handleDescrTextChange = (event: any): void => setDescrText(event.target.value)
  const handleDescrTextChange = (event: any, name: any) => {
    dispatch({
      type: 'CHANGE_TEXT',
      payload: {
        name,
        value: event.target.value
      }
    })
  }
  const filesTargetStringify = JSON.stringify(filesTarget)
  useEffect(() => {
    filesTarget?.forEach((file) => {
      if (!descriptions.has(file)) {
        dispatch({
          type: 'CHANGE_TEXT',
          payload: {
            name: file,
            value: file.name.substring(0, file.name.lastIndexOf('.'))
          }
        })
      }
    })
  }, [filesTargetStringify])

  const handleAddPosts = () => {
    ;[...filesTarget].forEach((file, index) => {
      const { title, description } = getTitleAndDescription(descriptions.get(file) || titleFile)
      console.group('Title and description')
      console.groupEnd()
      const newPost = {
        title,
        description,
        preview: file,
        video: file
      } as any
      dispatch(FeedService.createFeed(newPost))
    })
    setAddFilesView(false)
  }
  const handleDeleteMedia = (index) => {
    const entries = filesTarget.filter((item, itemIndex) => {
      return itemIndex !== index
    })
    dispatch({
      type: 'DELETE_ITEM',
      payload: `description-${index}`
    })
    setFilesTarget([...entries])
  }
  const handleAddFiles = () => {
    inputFileRef?.current.click()
  }
  const handleFilesTarget = (files: Array<any>) => {
    setFilesTarget([...filesTarget, ...files])
  }
  return (
    <section className={styles.viewport}>
      <AppHeader title="CREATOR" hideAddButtons inputFileRef={inputFileRef} setFilesTarget={handleFilesTarget} />
      <Button className={styles.addFilesButton} onClick={handleAddFiles}>
        ADD FILES:
      </Button>
      <section className={styles.content}>
        <section className={styles.feedContainer}>
          <Grid container spacing={3} style={{ marginTop: 30 }}>
            {filesTarget
              ? filesTarget.map((item: any, itemIndex) => {
                  return (
                    <Grid item xs={12} lg={6} xl={4} key={itemIndex} className={styles.gridItem}>
                      <Card className={styles.creatorItem} elevation={0} key={itemIndex}>
                        <div className={styles.imageWrapper}>
                          <CardMedia
                            component={`${item.type.startsWith('video') ? 'video' : 'img'}`}
                            className={styles.image}
                            image={URL.createObjectURL(item)}
                            controls
                          />
                          <span className={styles.removeItem} onClick={() => handleDeleteMedia(itemIndex)}>
                            <CloseIcon className={styles.close} />
                          </span>
                        </div>
                        <div style={{ padding: '0 30px 30px', margin: '25px 0' }}>
                          <TextField
                            autoFocus
                            inputProps={{
                              style: {
                                fontSize: '17pt',
                                fontFamily: 'Jost, sans-serif',
                                fontStyle: 'italic',
                                color: '#9b9b9b',
                                backgroundColor: '#fff'
                              }
                            }}
                            style={{ backgroundColor: '#fff' }}
                            margin="dense"
                            id={`description-${itemIndex}`}
                            label="Add description"
                            variant="outlined"
                            fullWidth
                            multiline
                            value={descriptions.get(item)}
                            onChange={(e) => handleDescrTextChange(e, item)}
                          />
                        </div>
                      </Card>
                    </Grid>
                  )
                })
              : ''}
          </Grid>
          <Button className={styles.publish} onClick={handleAddPosts}>
            <div>
              <AddIcon className={styles.addIcon} />
            </div>
            <div className={styles.addText}>Publish</div>
          </Button>
        </section>
      </section>
    </section>
  )
}

export default AddFilesForm
