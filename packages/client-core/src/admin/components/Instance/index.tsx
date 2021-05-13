import React from 'react';
import Grid from "@material-ui/core/Grid";
import Search from "../Search";
import Button from '@material-ui/core/Button';
// @ts-ignore
import styles from '../Admin.module.scss';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import IntanceTable from './IntanceTable';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        marginBottom: {
            marginBottom: "10px"
        }
    }),
);

const Instance = () => {
    const classes = useStyles();
    return (
        <div>
            <Grid container spacing={3} className={classes.marginBottom}>
                <Grid item xs={9}>
                    <Search typeName="Instance" />
                </Grid>
                <Grid item xs={3}>
                    <Button
                        className={styles.createLocation}
                        type="submit"
                        variant="contained"
                        color="primary"
                    // onClick={openModalCreate}
                    >
                        Create New Instance
                    </Button>
                </Grid>
            </Grid>
            
           <IntanceTable/>

        </div>
    )
}


export default Instance;