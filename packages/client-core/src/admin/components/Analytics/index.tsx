import React, { useEffect } from 'react'
import Card from './CardNumber'
import Grid from '@material-ui/core/Grid'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import ApiLinks from './ApiLinks'
import Graph from './Graph'
import ReactGa from 'react-ga'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '40vh'
      // maxWidth: "1500px"
    },
    mtopp: {
      marginTop: '20px'
    }
  })
)

const dataTest = [
  {
    id: 'japan',
    color: 'hsl(234, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 91
      },
      {
        x: 'helicopter',
        y: 82
      },
      {
        x: 'boat',
        y: 225
      },
      {
        x: 'train',
        y: 276
      },
      {
        x: 'subway',
        y: 186
      },
      {
        x: 'bus',
        y: 146
      },
      {
        x: 'car',
        y: 163
      },
      {
        x: 'moto',
        y: 71
      },
      {
        x: 'bicycle',
        y: 185
      },
      {
        x: 'horse',
        y: 28
      },
      {
        x: 'skateboard',
        y: 46
      },
      {
        x: 'others',
        y: 153
      }
    ]
  },
  {
    id: 'france',
    color: 'hsl(126, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 16
      },
      {
        x: 'helicopter',
        y: 263
      },
      {
        x: 'boat',
        y: 58
      },
      {
        x: 'train',
        y: 176
      },
      {
        x: 'subway',
        y: 58
      },
      {
        x: 'bus',
        y: 64
      },
      {
        x: 'car',
        y: 103
      },
      {
        x: 'moto',
        y: 133
      },
      {
        x: 'bicycle',
        y: 265
      },
      {
        x: 'horse',
        y: 12
      },
      {
        x: 'skateboard',
        y: 238
      },
      {
        x: 'others',
        y: 184
      }
    ]
  },
  {
    id: 'us',
    color: 'hsl(140, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 258
      },
      {
        x: 'helicopter',
        y: 235
      },
      {
        x: 'boat',
        y: 208
      },
      {
        x: 'train',
        y: 195
      },
      {
        x: 'subway',
        y: 214
      },
      {
        x: 'bus',
        y: 146
      },
      {
        x: 'car',
        y: 225
      },
      {
        x: 'moto',
        y: 56
      },
      {
        x: 'bicycle',
        y: 231
      },
      {
        x: 'horse',
        y: 18
      },
      {
        x: 'skateboard',
        y: 240
      },
      {
        x: 'others',
        y: 31
      }
    ]
  },
  {
    id: 'germany',
    color: 'hsl(161, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 97
      },
      {
        x: 'helicopter',
        y: 23
      },
      {
        x: 'boat',
        y: 113
      },
      {
        x: 'train',
        y: 32
      },
      {
        x: 'subway',
        y: 79
      },
      {
        x: 'bus',
        y: 188
      },
      {
        x: 'car',
        y: 229
      },
      {
        x: 'moto',
        y: 16
      },
      {
        x: 'bicycle',
        y: 119
      },
      {
        x: 'horse',
        y: 101
      },
      {
        x: 'skateboard',
        y: 227
      },
      {
        x: 'others',
        y: 250
      }
    ]
  },
  {
    id: 'norway',
    color: 'hsl(85, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 222
      },
      {
        x: 'helicopter',
        y: 220
      },
      {
        x: 'boat',
        y: 259
      },
      {
        x: 'train',
        y: 128
      },
      {
        x: 'subway',
        y: 62
      },
      {
        x: 'bus',
        y: 278
      },
      {
        x: 'car',
        y: 175
      },
      {
        x: 'moto',
        y: 23
      },
      {
        x: 'bicycle',
        y: 100
      },
      {
        x: 'horse',
        y: 268
      },
      {
        x: 'skateboard',
        y: 27
      },
      {
        x: 'others',
        y: 114
      }
    ]
  }
]

/**
 * Function for analytics on admin dashboard
 *
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

const Analytics = () => {
  const classes = useStyles()
  const data = [
    {
      number: '200K',
      label: 'Parties'
    },
    {
      number: '376K',
      label: 'Active Sessions'
    },
    {
      number: '3456K',
      label: 'Active Users'
    },
    {
      number: '453K',
      label: 'Instances'
    }
  ]

  useEffect(() => {
    ReactGa.initialize('UA-192756414-1', {
      debug: true,
      titleCase: false
    })

    ReactGa.pageview('/admin')
  }, [])

  return (
    <div>
      <Grid container spacing={3}>
        {data.map((el) => {
          return (
            <Grid item xs={3} key={el.number}>
              <Card data={el} />
            </Grid>
          )
        })}
      </Grid>
      <div className={classes.mtopp}>
        <Paper className={classes.paper}>
          <Graph data={dataTest} />
        </Paper>
      </div>
      <div className={classes.mtopp}>
        <ApiLinks />
      </div>
    </div>
  )
}

export default Analytics
