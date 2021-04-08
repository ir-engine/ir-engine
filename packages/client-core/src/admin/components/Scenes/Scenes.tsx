import getConfig from 'next/config';
import {
    Button,
    Tab,
    Tabs
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAdminState } from '../../reducers/admin/selector';
import { selectAppState } from "../../../common/reducers/app/selector";
import { selectAuthState } from "../../../user/reducers/auth/selector";
import { client } from "../../../feathers";
import { Router, withRouter } from "next/router";
import { PAGE_LIMIT } from '../../reducers/admin/reducers';
import FormControl from '@material-ui/core/FormControl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    fetchAdminLocations,
    fetchAdminScenes,
    fetchLocationTypes,
    fetchUsersAsAdmin,
    fetchAdminInstances
} from '../../reducers/admin/service';
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableSortLabel,
    Paper,
    TablePagination
} from '@material-ui/core';
import styles from './Scenes.module.scss';
import AddToContentPackModel from './AddToContentPackModal';
import UploadModal from "../ContentPack/DownloadModal";


if (!global.setImmediate) {
    global.setImmediate = setTimeout as any;
}

const { publicRuntimeConfig } = getConfig();

interface Props {
    router: Router;
    adminState?: any;
    authState?: any;
    locationState?: any;
    fetchAdminLocations?: any;
    fetchAdminScenes?: any;
    fetchLocationTypes?: any;
    fetchUsersAsAdmin?: any;
    fetchAdminInstances?: any;
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
    fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
    fetchAdminScenes: bindActionCreators(fetchAdminScenes, dispatch),
    fetchLocationTypes: bindActionCreators(fetchLocationTypes, dispatch),
    fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
    fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch)
});

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(0),
            minWidth: 120,
            backgroundColor: "white"
        },
        selectEmpty: {
            marginTop: theme.spacing(0),
        },
    }),
);

const Scenes = (props: Props) => {
    const classes = useStyles();
    const {
        router,
        adminState,
        authState,
        fetchAdminLocations,
        fetchAdminScenes,
        fetchLocationTypes,
        fetchUsersAsAdmin,
        fetchAdminInstances
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

    const initialInstance = {
        id: '',
        ipAddress: '',
        currentUsers: 0,
        locationId: ''
    };

    const user = authState.get('user');
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [instanceModalOpen, setInstanceModalOpen] = useState(false);
    const [locationEditing, setLocationEditing] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const [selectedInstance, setSelectedInstance] = useState(initialInstance);
    const adminScenes = adminState.get('scenes').get('scenes');


    const headCells = {
        locations: [
            { id: 'sid', numeric: false, disablePadding: true, label: 'ID' },
            { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
            { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
        ],
        users: [
            { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
            { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
            { id: 'instanceId', numeric: false, disablePadding: false, label: 'Instance ID' },
            { id: 'userRole', numeric: false, disablePadding: false, label: 'User Role' },
            { id: 'partyId', numeric: false, disablePadding: false, label: 'Party ID' }
        ],
        instances: [
            { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
            { id: 'ipAddress', numeric: false, disablePadding: false, label: 'IP address' },
            { id: 'gsId', numeric: false, disablePadding: false, label: 'Gameserver ID' },
            { id: 'serverAddress', numeric: false, disablePadding: false, label: 'Public address' },
            { id: 'currentUsers', numeric: true, disablePadding: false, label: 'Current # of Users' },
            { id: 'locationId', numeric: false, disablePadding: false, label: 'Location ID' }
        ]
    };
    
    const headCell = [
        { id: 'sid', numeric: false, disablePadding: true, label: 'ID' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
        { id: 'addToContentPack', numeric: false, disablePadding: false, label: 'Add to Content Pack'}
    ]

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
        const sceneMatch = adminScenes.find(scene => scene.sid === id);
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
        locations: {
            id: string,
            name: string,
            sceneId: string,
            maxUsersPerInstance: number,
            type: string,
            instanceMediaChatEnabled: boolean,
            videoEnabled: boolean
        },
        users: {
            id: string,
            name: string,
            instanceId: string,
            userRole: string,
            partyId: string
        }
    }

    interface HeadCell {
        disablePadding: boolean;
        id: string;
        label: string;
        numeric: boolean;
    }

    interface EnhancedTableProps {
        object: string,
        numSelected: number;
        onRequestSort: (event: React.MouseEvent<unknown>, property) => void;
        onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
        order: Order;
        orderBy: string;
        rowCount: number;
    }

    function EnhancedTableHead(props: EnhancedTableProps) {
        const { object, order, orderBy, onRequestSort } = props;
        const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead className={styles.thead}>
                <TableRow className={styles.trow}>
                    {headCell.map((headCell) => (
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

    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<any>('name');
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(PAGE_LIMIT);
    const [selectedTab, setSelectedTab] = useState('locations');
    const [refetch, setRefetch] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [selectedUser, setSelectedUser] = useState({});
    const [addToContentPackModalOpen, setAddToContentPackModalOpen] = useState(false);
    const [selectedScene, setSelectedScene] = useState({});

    const adminLocations = adminState.get('locations').get('locations');
    const adminLocationCount = adminState.get('locations').get('total');
    const adminUsers = adminState.get('users').get('users');
    const adminUserCount = adminState.get('users').get('total');
    const adminInstanceCount = adminState.get('instances').get('total');


    const selectCount = selectedTab === 'locations' ? adminLocationCount : selectedTab === 'users' ? adminUserCount : selectedTab === 'instances' ? adminInstanceCount : 0;

    const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
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

    const openModalCreate = () => {
        setSelectedLocation(initialLocation);
        setLocationEditing(false);
        setLocationModalOpen(true);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        const incDec = page < newPage ? 'increment' : 'decrement';
        switch (selectedTab) {
            case 'locations':
                fetchAdminLocations(incDec);
                break;
            case 'users':
                fetchUsersAsAdmin(incDec);
                break;
            case 'instances':
                fetchAdminInstances(incDec);
                break;
        }
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleInstanceClose = (e: any): void => {
        setInstanceModalOpen(false);
        setSelectedInstance(initialInstance);
    };

    const handleTabChange = (e: any, newValue: string) => {
        setSelectedTab(newValue);
    };
    
    const openAddToContentPackModal = (scene: any) => {
        setSelectedScene(scene);
        setAddToContentPackModalOpen(true);
    }

    const closeAddToContentPackModal = () => {
        setAddToContentPackModalOpen(false);
        setSelectedScene({});
    }

    const redirectToInstance = async (e: any, instanceId: string) => {
        try {
            const instance = await client.service('instance').get(instanceId);
            const location = await client.service('location').get(instance.locationId);
            const route = `/location/${location.slugifiedName}?instanceId=${instance.id}`;
            router.push(route);
        } catch (err) {
            console.log('Error redirecting to instance:');
            console.log(err);
        }
    };

    const fetchTick = () => {
        setTimeout(() => {
            setRefetch(true);
            fetchTick();
        }, 5000);
    };

    const patchUserRole = async ( user: any, role: string) => {
        await client.service('user').patch(user, {
            userRole: role
        });
    };

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>, user: any) => {
        let role = {};
        if (user) {
            patchUserRole(user, event.target.value as string);
            role[user] = event.target.value;
            setUserRole(event.target.value as string);
            setSelectedUser({ ...selectedUser, ...role });
        }
    };

    useEffect(() => {
        if (Object.keys(selectedUser).length === 0) {
            let role = {};
            adminUsers.forEach(element => {
                role[element.id] = element.userRole;
            });
            setSelectedUser(role);
        }
    }, [adminUsers]);

    useEffect(() => {
        fetchTick();
    }, []);

    useEffect(() => {
        if (user?.id != null && (adminState.get('scenes').get('updateNeeded') === true || refetch === true)) {
            fetchAdminScenes();
        }
        setRefetch(false);
    }, [authState, adminState, refetch]);

    return (
        <div>
            <Paper className={styles.adminRoot}>
                <TableContainer className={styles.tableContainer}>
                    <Table
                        stickyHeader
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                        aria-label="enhanced table"
                    >
                        <EnhancedTableHead
                            object={selectedTab}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={adminLocationCount || 0}
                        />
                        <TableBody className={styles.thead}>
                            {stableSort(adminScenes, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow
                                            hover
                                            className={styles.trowHover}
                                            style={{ color: 'black !important' }}
                                            // onClick={(event) => handleLocationClick(event, row.id.toString())}
                                            tabIndex={-1}
                                            key={row.id}
                                        >
                                            <TableCell className={styles.tcell} component="th" id={row.id.toString()}
                                                       align="right" scope="row" padding="none">
                                                {row.sid}
                                            </TableCell>
                                            <TableCell className={styles.tcell} align="right">{row.name}</TableCell>
                                            <TableCell className={styles.tcell}
                                                       align="right">{row.description}</TableCell>
                                            <TableCell className={styles.tcell} align="right">
                                                <Button onClick={() => openAddToContentPackModal(row)}>Add to Content Pack</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <div className={styles.tableFooter}>
                    {selectedTab !== 'locations' && <div />}
                    <TablePagination
                        rowsPerPageOptions={[PAGE_LIMIT]}
                        component="div"
                        count={selectCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        className={styles.tablePagination}
                    />
                </div>
                <AddToContentPackModel
                    open={addToContentPackModalOpen}
                    scene={selectedScene}
                    handleClose={closeAddToContentPackModal}
                />
            </Paper>
        </div>
    );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Scenes));
