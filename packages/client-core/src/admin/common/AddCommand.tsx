/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { BotCommandData } from '@etherealengine/engine/src/schemas/bot/bot-command.schema'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import List from '@etherealengine/ui/src/primitives/mui/List'
import ListItem from '@etherealengine/ui/src/primitives/mui/ListItem'
import ListItemSecondaryAction from '@etherealengine/ui/src/primitives/mui/ListItemSecondaryAction'
import ListItemText from '@etherealengine/ui/src/primitives/mui/ListItemText'

import styles from '../styles/admin.module.scss'

interface Props {
  command: BotCommandData
  handleChangeCommand: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
  addCommandData: (command: BotCommandData) => void
  commandData: BotCommandData[]
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
