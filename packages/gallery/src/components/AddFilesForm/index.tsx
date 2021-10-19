import React, { useEffect, useState, useReducer, useRef } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import styles from './AddFilesForm.module.scss'
import { Button, CardMedia, TextField, Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import AppHeader from '../Header'

import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'

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
  let [title, ...description] = str.split('\n')
  description = description.join('\n')
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
  const dispatch = useDispatch()
  const [descriptions, dispatchDescriptions] = useReducer(descriptionReducer, descriptionState)
  const [titleFile, setTitleFile] = useState('')
  const inputFileRef = useRef(null)

  // const handleDescrTextChange = (event: any): void => setDescrText(event.target.value)
  const handleDescrTextChange = (event: any, name: any) => {
    dispatchDescriptions({
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
        dispatchDescriptions({
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
      const { title, description } = getTitleAndDescription(descriptions.get(file))
      console.group('Title and description')
      console.groupEnd()
      const newPost = {
        title,
        description,
        preview: file,
        video: file
      } as any
      FeedService.createFeed(newPost)
    })
    setAddFilesView(false)
  }
  const handleDeleteMedia = (index) => {
    const file = filesTarget.find((item, itemIndex) => {
      return itemIndex === index
    })
    const entries = filesTarget.filter((item, itemIndex) => {
      return itemIndex !== index
    })
    if (!!file) {
      dispatchDescriptions({
        type: 'DELETE_ITEM',
        payload: { name: file }
      })
    }
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
                        </div>
                        <div className={styles.removeItem} onClick={() => handleDeleteMedia(itemIndex)}>
                          <CloseIcon className={styles.close} />
                        </div>
                        <div style={{ padding: '0 30px 30px', margin: '25px 0' }}>
                          <TextField
                            className={styles.textField}
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
                            label={false}
                            variant="outlined"
                            fullWidth
                            multiline
                            value={descriptions.get(item)}
                            onChange={(e) => handleDescrTextChange(e, item)}
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                      </Card>
                    </Grid>
                  )
                })
              : ''}
          </Grid>
          <Button
            className={`${styles.publish}${filesTarget.length ? '' : ` ${styles.hidden}`}`}
            onClick={handleAddPosts}
          >
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
