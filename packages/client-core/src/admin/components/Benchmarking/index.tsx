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

import { useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { useGet, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import styles from '../../styles/admin.module.scss'

const Benchmarking = () => {
  const { t } = useTranslation()
  const spawn = useHookstate(null as any)

  const bots = useGet('testbot', undefined).data

  const createTestBot = useMutation('testbot').create
  const spawnTestBot = () => {
    createTestBot().then((data) => {
      spawn.set(data)
    })
  }

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={6} sm={4}>
          <Button type="button" variant="contained" className={styles.openModalBtn} onClick={spawnTestBot}>
            {t('admin:components.bot.spawnBot')}
          </Button>
        </Grid>
      </Grid>

      {spawn.value && <Typography className={styles.heading}>Spawn bot status: {spawn.value.message}</Typography>}

      {bots && bots.length > 0 && (
        <Typography className={styles.secondaryHeading}>
          {t('admin:components.bot.lastRunStatus')}: {bots[0].status} ({t('admin:components.bot.autoRefreshing')})
        </Typography>
      )}
    </div>
  )
}

export default Benchmarking
