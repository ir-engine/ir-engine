import React from 'react'
import { useTranslation } from 'react-i18next'

import { BotCommands } from '@xrengine/common/src/interfaces/AdminBot'

import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'

import styles from '../styles/admin.module.scss'

interface Props {
  command: BotCommands
  handleChangeCommand: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
  addCommandData: (command: BotCommands) => void
  commandData: BotCommands[]
  removeCommand: (id: string) => void
}

const AddCommand = ({ command, handleChangeCommand, addCommandData, commandData, removeCommand }: Props) => {
  const { t } = useTranslation()
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <label>{t('admin:components.bot:command')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase
              className={styles.input}
              placeholder={t('admin:components.bot:enterCommand')}
              value={command.name}
              name="name"
              onChange={handleChangeCommand}
            />
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <label>{t('admin:components.bot.description')}</label>
          <Paper component="div" className={styles.createInput}>
            <InputBase
              className={styles.input}
              placeholder={t('admin:components.bot.enterDescription')}
              value={command.description}
              name="description"
              onChange={handleChangeCommand}
            />
          </Paper>
        </Grid>
      </Grid>

      <Button variant="contained" className={styles.openModalBtn} onClick={() => addCommandData(command)}>
        {t('admin:components.bot:addCommand')}
      </Button>
      <div className={commandData.length > 0 ? styles.alterContainer : styles.createAlterContainer}>
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
                    <DeleteIcon style={{ color: 'var(--iconButtonColor)' }} />
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
