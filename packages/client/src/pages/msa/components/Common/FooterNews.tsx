import React from 'react'
import { Grid, Typography } from '@mui/material'

const FooterNews = (props: any): any => {
  return (
    <Grid
      container
      alignItems="end"
      color={'white'}
      style={{
        fontSize: '16px',
        lineHeight: '19px'
      }}
    >
      <Grid item md={2} textAlign={'end'} style={{ backgroundColor: '#EB5858', padding: '0.5%' }}>
        <Typography variant={'body1'}>MSA TODAY</Typography>
      </Grid>
      <Grid item md={10} textAlign={'start'} style={{ backgroundColor: '#343434', padding: '0.5%' }}>
        <Typography variant={'body1'}>{props.news}</Typography>
      </Grid>
    </Grid>
  )
}
export default FooterNews
