import React from 'react'
import Grid from '@mui/material/Grid'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import { useStyles } from '../styles/ui'
import DeleteIcon from '@mui/icons-material/Delete'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'

interface Props {
  command: any
  handleChangeCommand: any
  addCommandData: (command: any) => void
  commandData: any
  removeCommand: (id: any) => void
}

const AddCommand = ({ command, handleChangeCommand, addCommandData, commandData, removeCommand }: Props) => {
  const classes = useStyles()
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <label>Command</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase
              className={classes.input}
              placeholder="Enter command"
              style={{ color: '#fff' }}
              value={command.name}
              name="name"
              onChange={handleChangeCommand}
            />
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <label>Description</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase
              className={classes.input}
              placeholder="Enter description"
              style={{ color: '#fff' }}
              value={command.description}
              name="description"
              onChange={handleChangeCommand}
            />
          </Paper>
        </Grid>
      </Grid>

      <Button variant="contained" className={classes.addCommand} onClick={() => addCommandData(command)}>
        Add command
      </Button>
      <div className={commandData.length > 0 ? classes.alterContainer : classes.createAlterContainer}>
        {commandData.map((el, i) => {
          return (
            <List dense={true} key={i}>
              <ListItem>
                <ListItemText primary={`${i + 1}. /${el.name} --> ${el.description} `} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" size="large" onClick={() => removeCommand(el.id)}>
                    <DeleteIcon style={{ color: '#fff' }} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          )
        })}
      </div>
    </div>
  )
}

export default AddCommand
