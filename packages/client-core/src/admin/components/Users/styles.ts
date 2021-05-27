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
    }
})
);

export const useStyle = makeStyles({
    paper: {
        width: "40%"
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
    }
});