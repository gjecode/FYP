import {
	useContext,
	useState,
	useEffect,
	forwardRef,
	SyntheticEvent,
} from "react";
import { useHistory } from "react-router-dom";
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
import PaymentDeleteModal from "../components/payment-delete-modal";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PageviewOutlinedIcon from "@mui/icons-material/PageviewOutlined";
import FormControl from "@mui/material/FormControl";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
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

interface PaymentType {
	[key: string]: any;
}
interface PaymentTypeArray extends Array<PaymentType> {}

interface Column {
	id:
		| "no"
		| "paymentIntent"
		| "dogID"
		| "dogName"
		| "customerEmail"
		| "createdAt";
	label: string;
	minWidth?: number;
	align?: "right";
}

export default function ManagePayments() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// store/set payments data to display on page
	const [payments, setPayments] = useState<PaymentTypeArray>();
	// store/set original payment data retrieved from Walks Service
	const [allPayments, setAllPayments] = useState<PaymentTypeArray>();
	// store/set a mapping of dog ID to dog name
	const [dogsDict, setDogsDict] = useState<DogsDictType>();
	const [dogs, setDogs] = useState<[string, string][]>();
	// enables dropdown fields
	const [dog, setDog] = useState<string>("");
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// track status of deleting data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// enables snackbar to display status after deleting data
	const [openAlert, setOpenAlert] = useState(false);
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
		{ id: "paymentIntent", label: "Payment Intent", minWidth: 170 },
		{ id: "dogID", label: "Dog ID (in DB)", minWidth: 170 },
		{ id: "dogName", label: "Dog Name", minWidth: 170 },
		{ id: "customerEmail", label: "Sponsor Email", minWidth: 170 },
		{ id: "createdAt", label: "Created At", minWidth: 170 },
	];

	// onClick event listener that routes admin to view payment page
	const handleViewPayment = (paymentID: string) => {
		history.push(`/admin/payments/${paymentID}`);
	};

	// async function to retrieve all payments
	const retrieveAllPayments = async () => {
		setLoading(true);

		const accessToken = JSON.parse(authTokens!).access;
		try {
			const response = await axios.get(
				`http://${orchestratorURL}/listPayments/`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			const responseData = response.data;

			function compareCreatedAt(a: PaymentType, b: PaymentType) {
				const dateA = new Date(a.createdAt);
				const dateB = new Date(b.createdAt);
				return dateB.getTime() - dateA.getTime();
			}
			responseData.sort(compareCreatedAt);
			setPayments(responseData);
			setAllPayments(responseData);
		} catch (error) {
			console.error("List Payments API error:", error);
			setPayments([]);
			setAllPayments([]);
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
			const entries: [string, string][] = Object.entries(dogsDict);
			entries.sort((a, b) => a[1].localeCompare(b[1]));
			setDogs(entries);
		} catch (error) {
			console.error("List Dogs API error:", error);
			setDogsDict({});
		} finally {
			setLoading(false);
		}
	};

	// function to delete record from data stored in state
	const handleDelete = (paymentID: string) => {
		const updatedPayments = payments?.filter(
			(payment) => payment.paymentIntent !== paymentID
		);
		setPayments(updatedPayments);
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
		const newDateString = dateString;
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
	const handleDog = (event: SelectChangeEvent) => {
		setDog(event.target.value as string);
	};

	// onClick event listener that clears all filters
	const handleClearFilters = () => {
		setDog("");
		setPayments(allPayments);
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
		retrieveAllPayments();
	}, []);

	// if status state changes, opens snackbar and resets status
	useEffect(() => {
		if (status) {
			setOpenAlert(false);
			setOpenAlert(true);
		} else {
			setOpenAlert(false);
		}
	}, [status]);

	// if dog state changes, filters payments by dog
	useEffect(() => {
		if (dog) {
			let filtered_payments = allPayments?.filter(
				(payment) => payment.dogID === String(dog)
			);
			setPayments(filtered_payments);
		} else {
			let filtered_payments = allPayments;
			setPayments(filtered_payments);
		}
		setPage(0);
	}, [dog]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Manage Payments" setTheme={theme} />
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
							{dogs && (
								<FormControl sx={{ width: "20%" }}>
									<InputLabel id="dog-label">
										<div style={{ display: "flex", alignItems: "flex-end" }}>
											<FilterAltOutlinedIcon
												fontSize="small"
												style={{ marginRight: ".5em" }}
											/>
											<span>Filter Payments by Dog</span>
										</div>
									</InputLabel>
									<Select
										labelId="dog-label"
										id="dog"
										name="dog"
										value={dog}
										label="genderssssssssssssssss"
										onChange={handleDog}
									>
										{dogs.map((dog) => (
											<MenuItem key={dog[0]} value={Number(dog[0])}>
												{dog[1]}
											</MenuItem>
										))}
										<MenuItem value="">None</MenuItem>
									</Select>
								</FormControl>
							)}
						</Stack>
					</Stack>
				</Container>
				<Container sx={{ mt: "9vh" }} maxWidth="xl">
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
												{payments && payments.length > 0 ? (
													payments
														.slice(
															page * rowsPerPage,
															page * rowsPerPage + rowsPerPage
														)
														.map((payment, index) => {
															return (
																<TableRow
																	role="checkbox"
																	tabIndex={-1}
																	key={payment.paymentIntent}
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
																				payment[column.id] !== null
																					? `${payment[column.id]}`
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
																						? dogsDict[payment["dogID"]]
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
																					handleViewPayment(
																						payment.paymentIntent
																					)
																				}
																				endIcon={
																					<PageviewOutlinedIcon fontSize="small" />
																				}
																			>
																				View
																			</Button>
																			<PaymentDeleteModal
																				paymentID={payment.paymentIntent}
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
										count={payments ? payments.length : 0}
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
		</ThemeProvider>
	);
}
