import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Card from '@material-ui/core/Card'
import styles from './AddFilesForm.module.scss'
import { Button, CardMedia, TextField, Typography } from '@material-ui/core'
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

const AddFilesForm = ({ filesTarget, createFeed, setAddFilesView }: Props) => {
  const [descrText, setDescrText] = useState('')
  const [titleFile, setTitleFile] = useState('')
  const [preview, setPreview] = useState(null)
  const [video, setVideo] = useState(null)

  const handleDescrTextChange = (event: any): void => setDescrText(event.target.value)
  const handleAddPosts = () => {
    ;[...filesTarget].forEach((file) => {
      const newPost = {
        title: titleFile,
        description: descrText,
        preview: file,
        video: file
      } as any
      console.log(newPost)
      createFeed(newPost)
    })
    setAddFilesView(false)
  }

  return (
    <section>
      <Button>ADD FILES</Button>
      <Button onClick={handleAddPosts}>Publish</Button>
      <section className={styles.feedContainer}>
        {filesTarget
          ? Array.from(filesTarget).map((item: any, itemIndex) => {
              console.log(item)
              return (
                <Card className={styles.creatorItem} elevation={0} key={itemIndex}>
                  <CardMedia style={{ height: 0, paddingTop: '25.25%' }} image={URL.createObjectURL(item)} />
                  <Typography>{item.name}</Typography>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Add description"
                    fullWidth
                    value={descrText}
                    onChange={handleDescrTextChange}
                  />
                </Card>
              )
            })
          : ''}
      </section>
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AddFilesForm)
