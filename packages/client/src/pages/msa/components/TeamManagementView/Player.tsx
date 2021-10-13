import React from 'react'
import styles from './TeamManagementView.module.scss'
import { CardMedia, Grid, LinearProgress, linearProgressClasses, styled } from '@mui/material'

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 7,
  borderRadius: 22,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#FF0000'
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 22,
    backgroundColor: '#05FF00'
  }
}))

const Player = ({ player }): any => {
  return (
    <Grid item>
      <div
        style={{
          backgroundImage: `url('/static/msa/play-ground-blur.png')`,
          borderRadius: '30px',
          border: '2px solid #CF5FC0',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <CardMedia
          component="img"
          image="/static/msa/player.png"
          sx={{ height: 'auto', width: 'auto', margin: 3 }}
          alt="Player"
        />

        <div className={styles.overlayTopRight + ' ' + styles.cardBackgroundBlackSmall} style={{ margin: '5%' }}>
          <Grid container paddingX={1.5} paddingY={1} spacing={2}>
            <Grid item>
              <img src="/static/msa/shoes.svg" alt="Shoes" />
            </Grid>
            <Grid item>
              <img src="/static/msa/fire.svg" alt="Fire" />
            </Grid>
          </Grid>
        </div>

        <div className={styles.overlayBottom}>
          <Grid
            container
            alignItems={'center'}
            paddingX={2}
            paddingY={player.MSA ? 1.1 : 2}
            className={styles.cardFooterBackgroundBlack}
          >
            <Grid item xs={6}>
              <span className={styles.playerTitle}>{player.name}</span>
              <br />
              <span className={styles.playerSubtitle}>{player.position}</span>
            </Grid>

            {player.MSA && (
              <Grid item xs={6}>
                <p
                  className={styles.cardBackgroundWhite}
                  style={{ fontSize: '10px', lineHeight: '12px', padding: '10%' }}
                >
                  <span>$MSA {player.MSA}</span>
                </p>
              </Grid>
            )}
          </Grid>
        </div>
      </div>

      {player.progress && (
        <div style={{ padding: '3%' }}>
          <BorderLinearProgress variant="determinate" value={player.progress} />
        </div>
      )}
    </Grid>
  )
}
export default Player
