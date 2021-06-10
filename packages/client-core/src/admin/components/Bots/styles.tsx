import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

export const useStylesForBots = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            background: "#15171B",
            color: "#fff"
        },
        rootLeft:{
            width: '100%',
            background: "#43484F",
            color: "#fff"
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            flexBasis: '33.33%',
            flexShrink: 0,
        },
        secondaryHeading: {
            fontSize: theme.typography.pxToRem(15),
            color: "#C0C0C0"
        },
        summary: {
            background: "#3a4149",
            borderBottom: "1px solid #23282c",
            color: "#f1f1f1",
            borderRadius: "0px"
        },
        details: {
            background: "#43484F",
            color: "#fff"
        },
        bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)'
        },
        title: {
            fontSize: 20,
        },
        pos: {
            marginBottom: 12
        },
        header: {
            height: "50px",
            background: "#343b41",
            color: "#fff",
            borderBottom: "1px solid #23282c",
            borderRadius: "0px",
            paddingTop: "8px",
            paddingLeft: "20px"
        },
        alterContainer: {
            background: "#343b41",
            border: "1px solid #23282c",
            borderRadius: "5px",
            width: "45vw",
            marginTop: "10px",
          },
          Inputroot: {
            padding: '2px 2px',
            display: 'flex',
            alignItems: 'center',
            width: "45vw",
            marginTop: "10px",
            marginBottom: "30px",
            background: "#343b41",
            border: "1px solid #23282c",
            color: "#f1f1f1"
          },
          createInput: {
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            //width: "45vw",
            marginTop: "10px",
            marginBottom: "15px",
            background: "#343b41",
            border: "1px solid #23282c",
            color: "#f1f1f1"
          },
          input: {
            marginLeft: theme.spacing(1),
            flex: 1,
            color: "#f1f1f1"
          },
          iconButton: {
            padding: 10,
            color: "#fff"
          },
          divider: {
            height: 28,
            margin: 4,
            background: "#fff"
          },
          displayCommand:{
            marginTop: "30px",
            background: "#3a4149",
            paddingLeft: "10px",
            paddingRight: "10px"
          }
    }),
);