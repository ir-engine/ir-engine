import React, { memo } from 'react'

import { Grid } from '@mui/material'

import ServerItemCard from './ServerItemCard'

const ServerList = ({ data, selectedCard, setSelectedCard }) => {
  return data.map((item, index) => (
    <Grid item key={item.id} xs={12} sm={6} md={2}>
      <ServerItemCard key={index} data={item} isSelected={selectedCard === item.id} onCardClick={setSelectedCard} />
    </Grid>
  ))
}

ServerList.displayName = 'ServerList'

ServerList.defaultProps = {}

export default memo(ServerList)
