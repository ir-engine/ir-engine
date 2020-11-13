import {Button, ThemeProvider} from '@material-ui/core';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import NoSSR from 'react-no-ssr';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Loading from '../../../components/scenes/loading';
import Layout from '../../../components/ui/Layout';
import { selectAdminState } from '../../../redux/admin/selector';
import { selectAppState } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { doLoginAuto } from '../../../redux/auth/service';
import theme from '../../../theme';
import {
    fetchAdminLocations,
    fetchAdminScenes,
    fetchLocationTypes
} from '../../../redux/admin/service';
import getConfig from "next/config";
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableSortLabel,
    Paper,
    Checkbox,
    Toolbar,
    Typography,
    Tooltip,
    IconButton,
    TablePagination,
    Switch,
    FormControlLabel
} from '@material-ui/core';
import {
    Delete,
    FilterList,
} from '@material-ui/icons';
import styles from './Admin.module.scss';
import LocationModal from './LocationModal';
import {closeDialog} from "../../../redux/dialog/service";

if (!global.setImmediate) {
    global.setImmediate = setTimeout as any;
}


interface Props {
    adminState?: any;
    authState?: any;
    doLoginAuto?: typeof doLoginAuto;
    locationState?: any;
    fetchAdminLocations?: any;
    fetchAdminScenes?: any;
    fetchLocationTypes?: any;
}

interface HeadCell {
    disablePadding: boolean;
    id: string;
    label: string;
    numeric: boolean;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
    fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
    fetchAdminScenes: bindActionCreators(fetchAdminScenes, dispatch),
    fetchLocationTypes: bindActionCreators(fetchLocationTypes, dispatch)
});

const AdminConsole = (props: Props) => {
    const {
        adminState,
        authState,
        doLoginAuto,
        fetchAdminLocations,
        fetchAdminScenes,
        fetchLocationTypes
    } = props;

    const initialLocation = {
        id: null,
        name: '',
        maxUsersPerInstance: 10,
        sceneId: null,
        locationSettingsId: null,
        location_setting: {
            instanceMediaChatEnabled: false,
            videoEnabled: false,
            locationType: 'private'
        }
    };

    const user = authState.get('user');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const adminScenes = adminState.get('scenes').get('scenes');

    const headCells: HeadCell[] = [
        { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'sceneId', numeric: false, disablePadding: false, label: 'Scene' },
        { id: 'maxUsersPerInstance', numeric: true, disablePadding: false, label: 'Max Users'},
        { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
        { id: 'instanceMediaChatEnabled', numeric: false, disablePadding: false, label: 'Enable public media chat' },
        { id: 'videoEnabled', numeric: false, disablePadding: false, label: 'Video Enabled' }
    ];

    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const getScene = (id: string): string => {
        const sceneMatch = adminScenes.find(scene => scene.id === id);
        return sceneMatch != null ? `${sceneMatch.name} (${sceneMatch.sid})` : '';
    };

    type Order = 'asc' | 'desc';

    function getComparator<Key extends keyof any>(
        order: Order,
        orderBy: Key,
    ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
        const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    interface Data {
        id: string,
        name: string,
        sceneId: string,
        maxUsersPerInstance: number,
        type: string,
        instanceMediaChatEnabled: boolean,
        videoEnabled: boolean
    }

    interface HeadCell {
        disablePadding: boolean;
        id: keyof Data;
        label: string;
        numeric: boolean;
    }

    interface EnhancedTableProps {
        numSelected: number;
        onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
        onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
        order: Order;
        orderBy: string;
        rowCount: number;
    }

    function EnhancedTableHead(props: EnhancedTableProps) {
        const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
        const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead className={styles.thead}>
                <TableRow className={styles.trow}>
                    {headCells.map((headCell) => (
                        <TableCell
                            className={styles.tcell}
                            key={headCell.id}
                            align='right'
                            padding={headCell.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof Data>('name');
    const [selected, setSelected] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const adminLocations = adminState.get('locations').get('locations');
    const displayLocations = adminLocations.map(location => {
        return {
            id: location.id,
            name: location.name,
            sceneId: location.sceneId,
            maxUsersPerInstance: location.maxUsersPerInstance,
            type: location.location_setting.locationType,
            instanceMediaChatEnabled: location.location_setting.instanceMediaChatEnabled.toString(),
            videoEnabled: location.location_setting.videoEnabled.toString()
        };
    });

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelecteds = adminLocations.map((n) => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selected = adminLocations.find(location => location.id === id);
        setSelectedLocation(selected);
        setEditing(true);
        setModalOpen(true);
    };

    const openModalCreate = () => {
        setSelectedLocation(initialLocation);
        setEditing(false);
        setModalOpen(true);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, adminLocations.length - page * rowsPerPage);

    const handleClose = (e: any): void => {
        setEditing(false);
        setModalOpen(false);
        setSelectedLocation(initialLocation);
    };

    useEffect(() => {
        if (user?.id != null && adminState.get('locations').get('updateNeeded') === true) {
            fetchAdminLocations();
        }
        if (user?.id != null && adminState.get('scenes').get('updateNeeded') === true) {
            fetchAdminScenes();
        }
        if (user?.id != null && adminState.get('locationTypes').get('updateNeeded') === true) {
            fetchLocationTypes();
        }
    }, [authState, adminState]);


    return (
        <Paper>
            <TableContainer>
                <Table
                    aria-labelledby="tableTitle"
                    size={dense ? 'small' : 'medium'}
                    aria-label="enhanced table"
                >
                    <EnhancedTableHead
                        numSelected={selected.length}
                        order={order}
                        orderBy={orderBy}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        rowCount={displayLocations.length || 0}
                    />
                    <TableBody className={styles.thead}>
                        {stableSort(displayLocations, getComparator(order, orderBy))
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => {
                                return (
                                    <TableRow
                                        hover
                                        className={styles.trow}
                                        style={{color: 'black !important'}}
                                        onClick={(event) => handleClick(event, row.id.toString())}
                                        tabIndex={-1}
                                        key={row.id}
                                    >
                                        <TableCell className={styles.tcell} component="th" id={row.id.toString()} align="right" scope="row" padding="none">
                                            {row.id}
                                        </TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.name}</TableCell>
                                        <TableCell className={styles.tcell} align="right">{getScene(row.sceneId as string)}</TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.maxUsersPerInstance}</TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.type}</TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.videoEnabled}</TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.instanceMediaChatEnabled}</TableCell>
                                    </TableRow>
                                );
                            })}
                        {/*{emptyRows > 0 && (*/}
                        {/*    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>*/}
                        {/*        <TableCell colSpan={6} />*/}
                        {/*    </TableRow>*/}
                        {/*)}*/}
                        <TableRow>
                            <TableCell>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={openModalCreate}
                                >
                                    Create New Location
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={displayLocations.length || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
            <LocationModal
                editing={editing}
                location={selectedLocation}
                open={modalOpen}
                handleClose={handleClose}
            />
        </Paper>
    );
};


export default connect(mapStateToProps, mapDispatchToProps)(AdminConsole);
