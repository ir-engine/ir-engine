import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { fetchAdminParty } from "../../reducers/admin/service";
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { selectAuthState } from '../../../user/reducers/auth/selector';
import { selectAdminState } from "../../reducers/admin/selector";

interface Column {
    id: 'instance' | 'location' | 'action';
    label: string;
    minWidth?: number;
    align?: 'right';
}

const columns: Column[] = [
    { id: 'instance', label: 'Instance', minWidth: 170 },
    { id: 'location', label: 'Location', minWidth: 100 },
    {
        id: 'action',
        label: 'Action',
        minWidth: 170,
        align: 'right',
    }
];

interface Data {
    id: string;
    instance: string;
    location: string;
    action: any
}

const useStyles = makeStyles({
    root: {
        width: '100%',
        background: "#fff"
    },
    container: {
        maxHeight: "80vh",
    },
    actionStyle: {
        textDecoration: "none",
        color: "#000",
        marginRight: "10px"
    }
});

interface Props {
   fetchAdminParty?: any;
   authState?: any;
   adminState?: any;
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchAdminParty: bindActionCreators(fetchAdminParty, dispatch)
});

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
        authState: selectAuthState(state)
    };
};

const PartyTable = (props: Props) => {
    const classes = useStyles();
    const { fetchAdminParty, adminState, authState } = props;

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const user = authState.get("user");
    const adminParty = adminState.get("parties");

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    React.useEffect(()=> {
        if(user.id && adminParty.get('updateNeeded') == true){
            fetchAdminParty();
        }
    }, [authState, adminState]);

   const createData = (id: string, instance: string, location: string ): Data => {
        return {
            id,
            instance,
            location,
            action: (
                <>
                <a href="#h" className={classes.actionStyle}> View </a>
                <a href="#h" className={classes.actionStyle}> Edit </a>
                <a href="#h" className={classes.actionStyle}> Delete </a>
            </>
            )
        };
   };

   const rows = adminParty.get("parties").map(el => createData(el.id, el.instanceId, el.locationId || "coming soon" ));

    return (
        <div className={classes.root}>
            <TableContainer className={classes.container}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                {value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={10}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    );
};


export default connect(mapStateToProps, mapDispatchToProps)(PartyTable);