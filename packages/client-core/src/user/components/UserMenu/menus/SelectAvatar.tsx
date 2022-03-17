import React from 'react'

import { ArrowBackIos, ArrowForwardIos, Cancel, Check, PersonAdd } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import styles from '../UserMenu.module.scss'

const selectAvatarMenu = () => {
  return (
    <div className={styles.avatarSelectContainer}>
      <div className={styles.avatarContainer}>
        <Grid container spacing={1} style={{ margin: 0 }}>
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <Grid key={value} item>
              <Paper
                className={styles.paper}
                sx={{
                  height: 140,
                  width: 170,
                  backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1A2027' : '#f1f1f1')
                }}
              >
                <img
                  className={styles.avatar}
                  src="https://localhost:8642/projects/default-project/public/avatars/CyberbotGold.png"
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
      <div className={styles.menuContainer}>
        <button type="button" className={`${styles.btnBack} ${styles.btnArrow}`}>
          <ArrowBackIos className={styles.size} />
        </button>
        <div className={styles.innerMenuContainer}>
          <button type="button" color="secondary" className={`${styles.btn} ${styles.btnCancel}`}>
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>X</span>
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnCheck}`}>
            <Check />
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPerson}`}>
            <PersonAdd className={styles.size} />
          </button>
        </div>
        <button type="button" className={`${styles.btn} ${styles.btnArrow}`}>
          <ArrowForwardIos className={styles.size} />
        </button>
      </div>
    </div>
  )
}

export default selectAvatarMenu
