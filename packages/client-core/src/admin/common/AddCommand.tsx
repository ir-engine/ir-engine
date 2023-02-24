import React from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@xrengine/client-core/src/common/components/InputText'
import { BotCommands } from '@xrengine/common/src/interfaces/AdminBot'
import Button from '@xrengine/ui/src/Button'
import Grid from '@xrengine/ui/src/Grid'
import Icon from '@xrengine/ui/src/Icon'
import IconButton from '@xrengine/ui/src/IconButton'
import List from '@xrengine/ui/src/List'
import ListItem from '@xrengine/ui/src/ListItem'
import ListItemSecondaryAction from '@xrengine/ui/src/ListItemSecondaryAction'
import ListItemText from '@xrengine/ui/src/ListItemText'

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
          <InputText
            name="name"
            label={t('admin:components.bot.command')}
            placeholder={t('admin:components.bot.enterCommand')}
            value={command.name}
            onChange={handleChangeCommand}
          />
        </Grid>
        <Grid item xs={8}>
          <InputText
            name="description"
            label={t('admin:components.bot.description')}
            placeholder={t('admin:components.bot.enterDescription')}
            value={command.description ?? ''}
            onChange={handleChangeCommand}
          />
        </Grid>
      </Grid>

      <Button variant="contained" className={styles.openModalBtn} onClick={() => addCommandData(command)}>
        {t('admin:components.bot.addCommand')}
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
                    title="delete"
                    size="large"
                    onClick={() => {
                      el.id && removeCommand(el.id)
                    }}
                    icon={<Icon type="Delete" style={{ color: 'var(--iconButtonColor)' }} />}
                  />
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
