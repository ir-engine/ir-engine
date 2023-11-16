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

import React, { useCallback, useEffect } from 'react'
import { BufferAttribute, BufferGeometry, InterleavedBufferAttribute } from 'three'

import { useHookstate } from '@etherealengine/hyperflux'

import DeleteIcon from '@mui/icons-material/DeleteForeverTwoTone'
import { Box, Grid, Stack, Typography } from '@mui/material'

import { Button } from '../inputs/Button'
import styles from '../layout/styles.module.scss'

const recalculateNormals = (geometry: BufferGeometry) => {
  geometry.computeVertexNormals()
}

export default function GeometryEditor({ geometry }: { ['geometry']: BufferGeometry | null }) {
  if (!geometry) return <></>
  const updateGeo = useHookstate(0)

  const updateGeoData = useCallback(
    () => ({
      uuid: geometry.uuid,
      name: geometry.name,
      attributes: Object.entries(geometry.attributes).map(([attribName, attrib]) => ({
        name: attribName,
        count: attrib.count,
        itemSize: attrib.itemSize,
        normalized: (attrib as BufferAttribute | InterleavedBufferAttribute).normalized
      }))
    }),
    [updateGeo]
  )

  const geoData = useHookstate(updateGeoData())
  useEffect(() => {
    geoData.set(updateGeoData())
  }, [updateGeo])

  const deleteBufferAttribute = useCallback(
    (attribName) => () => {
      geometry.deleteAttribute(attribName)
      updateGeo.set(updateGeo.get() + 1)
    },
    [geoData.uuid]
  )

  return (
    <div className={styles.contentContainer}>
      <div className={styles.divider} />
      <span>
        <Button onClick={() => recalculateNormals(geometry)}>Recalculate Normals</Button>
      </span>
      <Box>
        <Stack>
          {geoData.attributes.map((attribData, idx) => {
            return (
              <div key={`${geoData.uuid}-${idx}`}>
                <div className={styles.contentContainer}>
                  <Grid container alignItems={'center'}>
                    <Grid item xs={11}>
                      <span>
                        <label>Name:</label>
                        <Typography variant={'body1'}>{attribData.name.value}</Typography>
                      </span>
                      <div className={styles.divider} />
                      <span>
                        <label>Count:</label>
                        <Typography variant={'body1'}>{attribData.count.value}</Typography>
                      </span>
                      <div className={styles.divider} />
                      <span>
                        <label>Item Size:</label>
                        <Typography variant={'body1'}>{attribData.itemSize.value}</Typography>
                      </span>
                    </Grid>
                    <Grid item xs>
                      <DeleteIcon
                        className={styles.deleteButton}
                        onClick={deleteBufferAttribute(attribData.name.value)}
                      />
                    </Grid>
                  </Grid>
                </div>
              </div>
            )
          })}
        </Stack>
      </Box>
    </div>
  )
}
