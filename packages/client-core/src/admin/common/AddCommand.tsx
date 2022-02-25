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
import { BotCommands } from '@xrengine/common/src/interfaces/AdminBot'
import { useTranslation } from 'react-i18next'

interface Props {
  command: BotCommands
  handleChangeCommand: (e: any) => void
  addCommandData: (command: BotCommands) => void
  commandData: BotCommands[]
  removeCommand: (id: string) => void
}

const AddCommand = ({ command, handleChangeCommand, addCommandData, commandData, removeCommand }: Props) => {
  const { t } = useTranslation()
  const classes = useStyles()
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <label>{t('admin:components.bot:command')}</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase
              className={classes.input}
              placeholder={t('admin:components.bot:enterCommand')}
              style={{ color: '#fff' }}
              value={command.name}
              name="name"
              onChange={handleChangeCommand}
            />
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <label>{t('admin:components.bot.components.description')}</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase
              className={classes.input}
              placeholder={t('admin:components.bot.enterDescription')}
              style={{ color: '#fff' }}
              value={command.description}
              name="description"
              onChange={handleChangeCommand}
            />
          </Paper>
        </Grid>
      </Grid>

      <Button variant="contained" className={classes.addCommand} onClick={() => addCommandData(command)}>
        {t('admin:components.bot:addCommand')}
      </Button>
      <div className={commandData.length > 0 ? classes.alterContainer : classes.createAlterContainer}>
        {commandData.map((el, i) => {
          return (
            <List dense={true} key={i}>
              <ListItem>
                <ListItemText primary={`${i + 1}. /${el.name} --> ${el.description} `} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    size="large"
                    onClick={() => {
                      el.id && removeCommand(el.id)
                    }}
                  >
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
