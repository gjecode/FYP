import {
	useContext,
	useState,
	useEffect,
	forwardRef,
	SyntheticEvent,
} from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";

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
import AccountDeleteModal from "../components/account-delete-modal";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Chip from "@mui/material/Chip";
import PageviewOutlinedIcon from "@mui/icons-material/PageviewOutlined";
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

const actions = [{ icon: <AddOutlinedIcon />, name: "Add Account" }];

interface AccountsType {
	id: number;
	username: string;
	role: string;
}
interface AccountsTypeArray extends Array<AccountsType> {}

interface Column {
	id: "no" | "username" | "role";
	label: string;
	minWidth?: number;
	align?: "right";
}

export default function ManageAccounts() {
	// stores token and decoded token
	const { authTokens, user } = useContext(AuthContext);
	// set/stores account data to display on page
	const [accounts, setAccounts] = useState<AccountsTypeArray>();
	// tracks status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// tracks status of deleting data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// enables snackbar to display status after deleting data
	const [openAlert, setOpenAlert] = useState(false);
	// enables pagination
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(6);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// set columns and its headers
	const columns: readonly Column[] = [
		{ id: "no", label: "NO", minWidth: 170 },
		{ id: "username", label: "username", minWidth: 170 },
		{ id: "role", label: "role", minWidth: 170 },
	];

	// initialize history for routing
	const history = useHistory();

	// async function to retrieve ALL accounts from Account Service
	const retrieveAllAccounts = async () => {
		setLoading(true);

		const accessToken = JSON.parse(authTokens!).access;
		try {
			const response = await axios.get(
				`http://${orchestratorURL}/listAccounts/`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			const responseData = response.data;
			responseData.sort((a: AccountsType, b: AccountsType) => {
				if (a.role === b.role) {
					return a.username.localeCompare(b.username);
				}
				return a.role.localeCompare(b.role);
			});
			setAccounts(responseData);
		} catch (error) {
			console.error("List Accounts API error:", error);
			setAccounts([]);
		} finally {
			setLoading(false);
		}
	};

	// onClick event listener that routes admin to view account page
	const handleViewAccount = (accountID: number) => {
		history.push(`/admin/accounts/${accountID}`);
	};

	// onClick event listener that routes admin to add account page
	const handleAddAccount = () => {
		history.push(`/admin/addAccount`);
	};

	// function to delete dog category from data stored in state
	const handleDelete = (accountID: number) => {
		const updatedAccounts = accounts?.filter(
			(account) => account.id !== accountID
		);
		setAccounts(updatedAccounts);
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

	// onchange event listener that changes number of dog categories to display on one page
	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	// onClick event listener to redirect user back to previous page
	const handleBack = () => {
		history.goBack();
	};

	// on initial render, retrieve all accounts
	useEffect(() => {
		retrieveAllAccounts();
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

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Manage Accounts" setTheme={theme} />
			<main>
				<Container sx={{ pt: 4 }} maxWidth="xl">
					<Stack sx={{ mb: 4 }} spacing={4}>
						<Stack spacing={4} justifyContent="center" direction="row">
							<GoBackButton handleBack={handleBack} />
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
												{accounts && accounts.length > 0 ? (
													accounts
														.slice(
															page * rowsPerPage,
															page * rowsPerPage + rowsPerPage
														)
														.map((account, index) => {
															return (
																<TableRow
																	hover
																	role="checkbox"
																	tabIndex={-1}
																	key={account.id}
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
																				account[column.id] !== null
																					? `${account[column.id]}`
																					: null;
																			return (
																				<TableCell
																					key={column.id}
																					align={column.align}
																				>
																					{value}
																				</TableCell>
																			);
																		}
																	})}
																	{account &&
																	user &&
																	account.username !== user.username ? (
																		<TableCell sx={{ width: "8%" }}>
																			<Stack spacing={2}>
																				<Button
																					variant="outlined"
																					onClick={() =>
																						handleViewAccount(account.id)
																					}
																					endIcon={
																						<PageviewOutlinedIcon fontSize="small" />
																					}
																				>
																					View
																				</Button>
																				<AccountDeleteModal
																					accountID={account.id}
																					onDelete={handleDelete}
																					onStatus={handleStatus}
																				/>
																			</Stack>
																		</TableCell>
																	) : (
																		<TableCell sx={{ width: "8%" }}>
																			<Chip
																				label="Current User"
																				variant="outlined"
																				color="info"
																			/>
																		</TableCell>
																	)}
																</TableRow>
															);
														})
												) : (
													<TableRow role="checkbox" tabIndex={-1}>
														<TableCell align="center" colSpan={columns.length}>
															<h1>No Accounts Found!</h1>
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
									<TablePagination
										rowsPerPageOptions={[6]}
										component="div"
										count={accounts ? accounts.length : 0}
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
						onClick={handleAddAccount}
					/>
				))}
			</SpeedDial>
		</ThemeProvider>
	);
}
