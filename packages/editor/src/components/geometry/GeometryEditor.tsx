import { useCallback, useEffect } from 'react'
import React from 'react'
import { BufferGeometry } from 'three'

import { useHookEffect, useHookstate } from '@xrengine/hyperflux'

import DeleteIcon from '@mui/icons-material/DeleteForeverTwoTone'
import { Box, Grid, Stack, Typography } from '@mui/material'

import styles from '../layout/styles.module.scss'

export default function GeometryEditor({ geometry }: { ['geometry']: BufferGeometry }) {
  if (geometry === undefined) return <></>
  const updateGeo = useHookstate(0)

  const updateGeoData = useCallback(
    () => ({
      uuid: geometry.uuid,
      name: geometry.name,
      attributes: Object.entries(geometry.attributes).map(([attribName, attrib]) => ({
        name: attribName,
        count: attrib.count,
        itemSize: attrib.itemSize,
        normalized: attrib.normalized
      }))
    }),
    [updateGeo]
  )

  const geoData = useHookstate(updateGeoData())

  const deleteBufferAttribute = useCallback(
    (attribName) => () => {
      geometry.deleteAttribute(attribName)
      updateGeo.set(updateGeo.get() + 1)
    },
    [geoData.uuid]
  )

  return (
    <div className={styles.contentContainer}>
      <Box>
        <Typography variant={'h5'}>Geometry</Typography>
      </Box>
      <div className={styles.divider} />
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
