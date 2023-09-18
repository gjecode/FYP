import {
	useContext,
	useState,
	useEffect,
	forwardRef,
	SyntheticEvent,
} from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

import "../css/styles.css";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import AdminNavBar from "../components/admin-nav-bar";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import RecordDeleteModal from "../components/record-delete-modal";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import PageviewOutlinedIcon from "@mui/icons-material/PageviewOutlined";
import TextField from "@mui/material/TextField";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import GoBackButton from "../components/go-back-button";

const theme = createTheme({
	palette: {
		primary: {
			main: "#0d6efd",
		},
		secondary: {
			main: "#2A2E45",
		},
	},
});

const actions = [{ icon: <AddOutlinedIcon />, name: "Add Record" }];

interface DogType {
	[key: string]: any;
}

interface DogsDictType {
	[key: string]: any;
}

interface RecordType {
	[key: string]: any;
}
interface RecordTypeArray extends Array<RecordType> {}

interface Column {
	id: "no" | "dogID" | "dogName" | "handler" | "createdAt";
	label: string;
	minWidth?: number;
	align?: "right";
}

interface ParamsType {
	id: string;
}

export default function ManageFilteredRecords() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// get dog ID from parameter in URL
	const { id } = useParams<ParamsType>();
	// store/set records data to display on page
	const [records, setRecords] = useState<RecordTypeArray>();
	// store/set original records data retrieved from Walks Service
	const [allRecords, setAllRecords] = useState<RecordTypeArray>();
	// store/set a mapping of dog ID to dog name
	const [dogsDict, setDogsDict] = useState<DogsDictType>();
	// enables filter fields
	const [dogQuery, setDogQuery] = useState<string>("");
	const [handlerQuery, setHandlerQuery] = useState<string>("");
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// track status of deleting data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// enables snackbar to display status after deleting data
	const [openAlert, setOpenAlert] = useState(false);
	// tracks initial load
	const [initialLoad, setInitialLoad] = useState<boolean>(false);
	// track pagination
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// initialize history for routing
	const history = useHistory();

	// set columns and its headers
	const columns: readonly Column[] = [
		{ id: "no", label: "NO", minWidth: 170 },
		{ id: "dogID", label: "Dog ID (in DB)", minWidth: 170 },
		{ id: "dogName", label: "Dog Name", minWidth: 170 },
		{ id: "handler", label: "Handler", minWidth: 170 },
		{ id: "createdAt", label: "Created At", minWidth: 170 },
	];

	// onClick event listener that routes admin to view record page
	const handleViewRecord = (recordID: number) => {
		history.push(`/admin/records/${recordID}`);
	};

	// onClick event listener that routes admin to add record page
	const handleAddRecord = () => {
		history.push(`/admin/addRecord`);
	};

	// async function to retrieve all records
	const retrieveAllRecords = async () => {
		setLoading(true);

		const accessToken = JSON.parse(authTokens!).access;
		try {
			const response = await axios.get(`http://${orchestratorURL}/listWalks/`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			const responseData = response.data;

			function compareCreatedAt(a: RecordType, b: RecordType) {
				const dateA = new Date(a.createdAt);
				const dateB = new Date(b.createdAt);
				return dateB.getTime() - dateA.getTime();
			}
			responseData.sort(compareCreatedAt);
			setRecords(responseData);
			setAllRecords(responseData);
		} catch (error) {
			console.error("List Records API error:", error);
			setRecords([]);
			setAllRecords([]);
		} finally {
			setLoading(false);
		}
	};

	// async function to retrieve all dogs and get mapping of dog ID to dog Name
	const retrieveAllDogs = async () => {
		setLoading(true);

		try {
			const response = await axios.get(
				`http://${orchestratorURL}/publicListDogs/`
			);
			const responseData = response.data;
			const dogsDict = responseData
				.filter((obj: DogType) => obj.id && obj.name)
				.reduce((result: DogsDictType, obj: DogType) => {
					result[obj.id] = obj.name;
					return result;
				}, {});
			setDogsDict(dogsDict);
		} catch (error) {
			console.error("List Dogs API error:", error);
			setDogsDict({});
		} finally {
			setLoading(false);
		}
	};

	// function to delete record from data stored in state
	const handleDelete = (recordID: number) => {
		const updatedRecords = records?.filter((record) => record.id !== recordID);
		setRecords(updatedRecords);
		setPage(0);
	};

	// function to set status after deleting data
	const handleStatus = (status: string) => {
		setStatus(status);
	};

	// function that enables snackbar to display status after deleting data
	const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
		props,
		ref
	) {
		return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
	});

	// onclick event listener that handles closing of snackbar
	const handleAlertClose = (
		event?: SyntheticEvent | Event,
		reason?: string
	) => {
		if (reason === "clickaway") {
			return;
		}
		setOpenAlert(false);
	};

	// onClick event listener that changes page number
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	// onchange event listener that changes number of records to display on one page
	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	// function that re-formats date
	const formatDate = (dateString: string) => {
		const newDateString = dateString.slice(0, -1) + "+08:00";
		const singaporeTimeOptions: Intl.DateTimeFormatOptions = {
			timeZone: "Asia/Singapore",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		};

		const singaporeDate = new Intl.DateTimeFormat(
			"en-SG",
			singaporeTimeOptions
		).format(new Date(newDateString));

		return singaporeDate;
	};

	// onchange event listener to enable dog dropdown field
	const handleDog = (event: React.ChangeEvent<HTMLInputElement>) => {
		const dogQuery = event.target.value;
		setDogQuery(dogQuery);
		if (dogQuery) {
			let filtered_records = allRecords?.filter((record) =>
				record.dogName.toLowerCase().includes(dogQuery.toLowerCase())
			);
			if (handlerQuery.length > 0) {
				filtered_records = filtered_records?.filter((record) =>
					record.handler.toLowerCase().includes(handlerQuery.toLowerCase())
				);
			}
			setRecords(filtered_records);
		} else {
			let filtered_records = allRecords;
			if (handlerQuery.length > 0) {
				filtered_records = filtered_records?.filter((record) =>
					record.handler.toLowerCase().includes(handlerQuery.toLowerCase())
				);
			}
			setRecords(filtered_records);
		}
		setPage(0);
	};

	// onchange event listener to enable dog dropdown field
	const handleHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const handlerQuery = event.target.value;
		setHandlerQuery(handlerQuery);
		if (handlerQuery) {
			let filtered_records = allRecords?.filter((record) =>
				record.handler.toLowerCase().includes(handlerQuery.toLowerCase())
			);
			if (dogQuery.length > 0) {
				filtered_records = filtered_records?.filter((record) =>
					record.dogName.toLowerCase().includes(dogQuery.toLowerCase())
				);
			}
			setRecords(filtered_records);
		} else {
			let filtered_records = allRecords;
			if (dogQuery.length > 0) {
				filtered_records = filtered_records?.filter((record) =>
					record.dogName.toLowerCase().includes(dogQuery.toLowerCase())
				);
			}
			setRecords(filtered_records);
		}
		setPage(0);
	};

	// onClick event listener that clears all filters
	const handleClearFilters = () => {
		setDogQuery("");
		setHandlerQuery("");
		setRecords(allRecords);
		setPage(0);
	};

	// onClick event listener to redirect user back to previous page
	const handleBack = () => {
		history.goBack();
	};

	// on initial render, retrieve all dogs to get mapping of dog ID to dog Name
	// and retrieve all records
	useEffect(() => {
		retrieveAllDogs();
		retrieveAllRecords();
	}, []);

	// if dogQuery and handlerQuery is blank, when dogsDict and records initialises
	// iterate through records and add dogName key-value pair based on dogID
	useEffect(() => {
		if (!dogQuery && !handlerQuery) {
			if (
				dogsDict &&
				Object.keys(dogsDict).length > 0 &&
				records &&
				Object.keys(records).length > 0
			) {
				const new_records = records.map((record) => {
					const dogName = dogsDict[record.dogID];
					return { ...record, dogName };
				});
				setRecords(new_records);
				setAllRecords(new_records);
				if (!initialLoad) {
					setDogQuery(dogsDict[id]);
					const filtered_records = new_records?.filter((record) =>
						record.dogName.toLowerCase().includes(dogsDict[id].toLowerCase())
					);
					setRecords(filtered_records);
					setInitialLoad(true);
				}
			}
		}
	}, [dogsDict, records, dogQuery, handlerQuery]);

	// if status state changes, opens snackbar and resets status
	useEffect(() => {
		if (status) {
			setOpenAlert(false);
			setOpenAlert(true);
		} else {
			setOpenAlert(false);
		}
	}, [status]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Manage Records" setTheme={theme} />
			<main>
				<Container sx={{ pt: 8 }} maxWidth="xl">
					<Stack sx={{ mb: 4 }} spacing={4}>
						<Stack spacing={4} justifyContent="center" direction="row">
							<GoBackButton handleBack={handleBack} />
							<Button
								variant="outlined"
								onClick={handleClearFilters}
								endIcon={<FilterAltOffOutlinedIcon />}
								sx={{ width: "8%" }}
							>
								Clear Filters
							</Button>
							<TextField
								id="dog-search"
								label={
									<div style={{ display: "flex", alignItems: "flex-end" }}>
										<SearchOutlinedIcon
											fontSize="small"
											style={{ marginRight: ".5em" }}
										/>
										<span>Search for Records by Dog Name</span>
									</div>
								}
								variant="outlined"
								onChange={handleDog}
								sx={{ width: "20%" }}
								value={dogQuery}
							/>
							<TextField
								id="handler-search"
								label={
									<div style={{ display: "flex", alignItems: "flex-end" }}>
										<SearchOutlinedIcon
											fontSize="small"
											style={{ marginRight: ".5em" }}
										/>
										<span>Search for Records by Handler</span>
									</div>
								}
								variant="outlined"
								onChange={handleHandler}
								sx={{ width: "20%" }}
								value={handlerQuery}
							/>
						</Stack>
					</Stack>
				</Container>
				<Container sx={{ mt: "9vh" }} maxWidth="lg">
					<Grid container spacing={4} justifyContent="center">
						{loading ? (
							<Grid
								container
								spacing={4}
								justifyContent="center"
								sx={{ mt: 4 }}
							>
								<CircularProgress />
							</Grid>
						) : (
							<Grid container spacing={4}>
								<Paper sx={{ width: "100%" }} elevation={3}>
									<TableContainer>
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
													<TableCell></TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{records && records.length > 0 ? (
													records
														.slice(
															page * rowsPerPage,
															page * rowsPerPage + rowsPerPage
														)
														.map((record, index) => {
															return (
																<TableRow
																	role="checkbox"
																	tabIndex={-1}
																	key={record.id}
																>
																	{columns.map((column) => {
																		if (column.id === "no") {
																			return (
																				<TableCell
																					key={column.id}
																					align={column.align}
																				>
																					{index + 1 + page * rowsPerPage}
																				</TableCell>
																			);
																		} else {
																			const value =
																				record[column.id] !== null
																					? `${record[column.id]}`
																					: null;
																			return (
																				<TableCell
																					key={column.id}
																					align={column.align}
																				>
																					{column.id === "createdAt" && value
																						? formatDate(value)
																						: column.id === "dogName" &&
																						  dogsDict
																						? dogsDict[record["dogID"]]
																						: value}
																				</TableCell>
																			);
																		}
																	})}
																	<TableCell sx={{ width: "8%" }}>
																		<Stack spacing={2}>
																			<Button
																				variant="outlined"
																				onClick={() =>
																					handleViewRecord(record.id)
																				}
																				endIcon={
																					<PageviewOutlinedIcon fontSize="small" />
																				}
																			>
																				View
																			</Button>
																			<RecordDeleteModal
																				recordID={record.id}
																				onDelete={handleDelete}
																				onStatus={handleStatus}
																			/>
																		</Stack>
																	</TableCell>
																</TableRow>
															);
														})
												) : (
													<TableRow role="checkbox" tabIndex={-1}>
														<TableCell align="center" colSpan={columns.length}>
															<h1>No Records Found!</h1>
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
									<TablePagination
										rowsPerPageOptions={[6]}
										component="div"
										count={records ? records.length : 0}
										rowsPerPage={rowsPerPage}
										page={page}
										onPageChange={handleChangePage}
										onRowsPerPageChange={handleChangeRowsPerPage}
									/>
								</Paper>
							</Grid>
						)}
					</Grid>
				</Container>
			</main>
			<Snackbar
				open={openAlert}
				autoHideDuration={alertTimeout}
				onClose={handleAlertClose}
			>
				<Alert
					onClose={handleAlertClose}
					severity={
						status.split(" ")[0] === "Successfully" ? "success" : "error"
					}
					sx={{ width: "100%" }}
				>
					{status}
				</Alert>
			</Snackbar>
			<SpeedDial
				ariaLabel="speeddial"
				sx={{ position: "fixed", bottom: "4%", right: "3%" }}
				icon={<SpeedDialIcon />}
			>
				{actions.map((action) => (
					<SpeedDialAction
						key={action.name}
						icon={action.icon}
						tooltipTitle={action.name}
						onClick={handleAddRecord}
					/>
				))}
			</SpeedDial>
		</ThemeProvider>
	);
}
