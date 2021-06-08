import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
export const useStyles = makeStyles((theme: Theme) =>
createStyles({
    marginBottm: {
        marginBottom: "15px"
    },
    textLink: {
        marginLeft: "5px",
        textDecoration: "none",
        color: "#ff9966"
    },
    marginTop: {
        marginTop: "30px"
    }
})
);

export const useStyle = makeStyles({
    root: {
        width: '100%',
        background: "#fff"
    },
    container: {
        maxHeight: "80vh"
    },
    actionStyle: {
        textDecoration: "none",
        color: "#000",
        marginRight: "10px"
    }
});