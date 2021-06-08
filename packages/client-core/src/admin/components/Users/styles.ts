import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        large: {
            width: theme.spacing(14),
            height: theme.spacing(14),
            marginTop: "20%"
        },
        paperHeight: {
            height: "20vh"
        },
        mt20: {
            marginTop: "20%"
        },
        mt10: {
            marginTop: "10%"
        },
        mb10: {
            marginBottom: "10%"
        },
        mb20px: {
            marginBottom: "20px"
        },
        searchRoot: {
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: "100%",
        },
        input: {
            marginLeft: theme.spacing(1),
            flex: 1,
        },
        iconButton: {
            padding: 10,
        },
        divider: {
            height: 28,
            margin: 4,
        },
        marginBottm: {
            marginBottom: "15px"
        },
        textLink: {
            marginLeft: "5px",
            textDecoration: "none",
            color: "#ff9966"
        },
        marginTp: {
            marginTop: "20%"
        },
        texAlign: {
            textAlign: "center"
        }
    })
);

export const useStyle = makeStyles({
    paper: {
        width: "40%"
    },
    paperDialog: {
      background: "#fff !important"
    },
    root: {
        width: '100%',
    },
    container: {
        maxHeight: "80vh",
    },
    actionStyle: {
        textDecoration: "none",
        color: "#000",
        marginRight: "10px"
    },
    spanDange: {
        color: "#8C001A"
    },
    spanNone: {
        color: "#808080"
    },
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    }
});