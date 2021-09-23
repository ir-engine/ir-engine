import React, { useEffect, useState, useReducer } from 'react'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import styles from './AddFilesForm.module.scss'
import { Button, CardMedia, TextField, Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { bindActionCreators, Dispatch } from 'redux'
import { createFeed } from '../../reducers/post/service'

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createFeed: bindActionCreators(createFeed, dispatch)
})

interface Props {
  filesTarget?: any
  setFilesTarget?: any
  setAddFilesView?: any
  createFeed?: typeof createFeed
}

const descriptionState = {}

const descriptionReducer = (state, action) => {
  const { name, value } = action.payload
  switch (action.type) {
    case 'ADD_TEXT':
      return {
        ...state,
        [name]: value
      }
      break

    default:
      return state
      break
  }
}

const AddFilesForm = ({ filesTarget, createFeed, setAddFilesView }: Props) => {
  const [descrText, setDescrText] = useState('')
  const [descriptions, dispatch] = useReducer(descriptionReducer, descriptionState)
  const [titleFile, setTitleFile] = useState('')
  const [preview, setPreview] = useState(null)
  const [video, setVideo] = useState(null)

  // const handleDescrTextChange = (event: any): void => setDescrText(event.target.value)
  const handleDescrTextChange = (event: any, name: string) => {
    console.log(descriptions)
    dispatch({
      type: 'CHANGE_TEXT',
      payload: {
        name,
        value: event.target.value
      }
    })
  }
  const handleAddPosts = () => {
    console.log(descriptions)
    ;[...filesTarget].forEach((file, index) => {
      const newPost = {
        title: titleFile,
        description: descriptions[`description-${index}`],
        preview: file,
        video: file
      } as any
      console.log(newPost)
      createFeed(newPost)
    })
    setAddFilesView(false)
  }

  return (
    <section className={styles.viewport}>
      <Button>ADD FILES</Button>
      <Button onClick={handleAddPosts}>Publish</Button>
      <section className={styles.feedContainer}>
        <Grid container spacing={3} style={{ marginTop: 30 }}>
          {filesTarget
            ? Array.from(filesTarget).map((item: any, itemIndex) => {
                console.log(item)
                return (
                  <Grid item xs={12} lg={6} xl={4} key={itemIndex} className={styles.gridItem}>
                    <Card className={styles.creatorItem} elevation={0} key={itemIndex}>
                      <div className={styles.imageWrapper}>
                        <CardMedia component="img" className={styles.image} image={URL.createObjectURL(item)} />
                        <span className={styles.removeItem}>
                          <CloseIcon className={styles.close} />
                        </span>
                      </div>
                      {/* <Typography>{item.name}</Typography> */}
                      <div style={{ padding: '0 30px 30px', margin: '25px 0' }}>
                        <TextField
                          autoFocus
                          inputProps={{
                            style: {
                              fontSize: '17pt',
                              fontFamily: 'Jost, sans-serif',
                              color: '#9b9b9b'
                            }
                          }}
                          margin="dense"
                          id={`description-${itemIndex}`}
                          label="Add description"
                          variant="outlined"
                          fullWidth
                          value={descriptions[`description-${itemIndex}`]}
                          onChange={(e) => handleDescrTextChange(e, `description-${itemIndex}`)}
                        />
                      </div>
                    </Card>
                  </Grid>
                )
              })
            : ''}
        </Grid>
      </section>
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AddFilesForm)
