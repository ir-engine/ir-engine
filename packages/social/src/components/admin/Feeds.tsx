/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useState, useEffect } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Button, Typography } from '@mui/material'
import Modal from '@mui/material/Modal'
import { FormControl, InputLabel, Input, FormHelperText } from '@mui/material'

// const thefeeds = '';
// conts Feeds = '';

interface Props {
  create?: any
  getTheFeeds?: any
  createTheFeeds?: any
  createTheFeedsNew?: any
  deleteTheFeed?: any
  update?: any
  list?: any
}

const TheFeedsConsole = ({ create, list, deleteTheFeed, update }: Props) => {
  var rows = list.map((i) => createData(i.title, i.id, i.videoUrl, i.description, i.videoId))

  const useStyles = makeStyles({
    table: {
      minWidth: 650
    },
    form: {
      display: 'Flex',
      flexDirection: 'column',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '90px',
      width: 'max-content',
      padding: '60px',
      background: '#fff'
    }
  })
  function createData(title: string, id: string, videoUrl: string, description: string, videoId: string) {
    return { title, id, videoUrl, description, videoId }
  }

  const classes = useStyles()

  const [open, setOpen] = React.useState(false)

  const [actiontitle, setTitle] = useState(null)
  const [actionId, setId] = useState(null)
  const [actionVideo, setVideo] = useState(null)
  const [actionDescription, setDescription] = useState(null)

  const handleOpen = (title, id, videoUrl, description) => {
    setOpen(true)
    if (title) setTitle(title)
    if (id) setId(id)
    if (videoUrl) setVideo(videoUrl)
    if (description) setDescription(description)
  }
  const handleClose = () => {
    setOpen(false)
  }
  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (actionId !== '' && actionId !== null) {
      update({ id: actionId, title: actiontitle, video: actionVideo, description: actionDescription })
    } else {
      create({ title: actiontitle, description: actionDescription, video: actionVideo })
    }
    setOpen(false)
    setTitle('')
    setId('')
    setVideo('')
    setDescription('')
  }

  return (
    <div>
      <Typography variant="h1" color="primary">
        Social Feeds List
      </Typography>
      <Button
        onClick={() => {
          handleOpen('', '', '', '')
        }}
        variant="outlined"
        color="secondary"
      >
        Create
      </Button>

      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell align="right">Id</TableCell>
              <TableCell align="right">Video</TableCell>
              <TableCell align="right">Description</TableCell>
            </TableRow>
          </TableHead>
          {rows && rows.length > 0 && (
            <TableBody>
              {rows.reverse().map((row) => (
                <TableRow key={row.title}>
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell align="right">{row.id}</TableCell>
                  <TableCell align="right">{row.videoUrl}</TableCell>
                  <TableCell align="right">{row.description}</TableCell>
                  <TableCell align="right">
                    <Button onClick={() => handleOpen(row.title, row.id, row.videoId, row.description)}>Edit</Button>
                  </TableCell>
                  <TableCell align="right">
                    <Button onClick={() => deleteTheFeed(row.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div>
          <form className={classes.form} noValidate onSubmit={(e) => handleSubmit(e)}>
            <FormControl>
              <InputLabel htmlFor="thefeeds-title">Title</InputLabel>
              <Input
                value={actiontitle ? actiontitle : ''}
                onChange={(e) => setTitle(e.target.value)}
                id="thefeeds-title"
                type="text"
                aria-describedby="my-helper-text"
              />
              <FormHelperText id="my-helper-text">Tip&Trick Title.</FormHelperText>
            </FormControl>
            <input
              value={actionId ? actionId : ''}
              onChange={(e) => setId(e.target.value)}
              id="thefeeds-id"
              type="number"
              hidden
            />
            <Button variant="contained" component="label">
              Upload File
              <input
                onChange={(e) => {
                  setVideo(e.target.files[0])
                }}
                id="thefeeds-video"
                type="file"
                hidden
              />
            </Button>

            <FormControl>
              <InputLabel htmlFor="thefeeds-description">Description</InputLabel>
              <Input
                value={actionDescription ? actionDescription : ''}
                onChange={(e) => setDescription(e.target.value)}
                id="thefeeds-description"
                type="text"
                aria-describedby="my-helper-text"
              />
              <FormHelperText id="my-helper-text">Tip&Trick short description.</FormHelperText>
            </FormControl>
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
            <Button variant="contained" color="secondary" onClick={() => handleClose()}>
              Close
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  )
}

export default TheFeedsConsole
