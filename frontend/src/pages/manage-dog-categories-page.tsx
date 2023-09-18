import {
	useContext,
	useState,
	useEffect,
	forwardRef,
	SyntheticEvent,
} from "react";
import { useHistory } from "react-router-dom";
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
import CategoryDeleteModal from "../components/category-delete-modal";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
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

const actions = [{ icon: <AddOutlinedIcon />, name: "Add Dog Category" }];

interface CategoryType {
	id: number;
	name: string;
	desc: string;
	image: string;
}
interface CategoryTypeArray extends Array<CategoryType> {}

interface Column {
	id: "no" | "name" | "desc" | "image";
	label: string;
	minWidth?: number;
	align?: "right";
}

export default function ManageDogCategories() {
	// store/set dog categories data to display on page
	const [categories, setCategories] = useState<CategoryTypeArray>();
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// track status of deleting data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// enables snackbar to display status after deleting data
	const [openAlert, setOpenAlert] = useState(false);
	// track pagination
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(6);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// initialize history for routing
	const history = useHistory();

	// set columns and its headers
	const columns: readonly Column[] = [
		{ id: "no", label: "NO", minWidth: 170 },
		{ id: "name", label: "Name", minWidth: 170 },
		{ id: "desc", label: "Description", minWidth: 170 },
		{ id: "image", label: "Image", minWidth: 170 },
	];

	// onClick event listener that routes admin to view dog category page
	const handleViewCategory = (categoryID: number) => {
		history.push(`/admin/dogCategories/${categoryID}`);
	};

	// onClick event listener that routes admin to add dog category page
	const handleAddCategory = () => {
		history.push(`/admin/addDogCategory`);
	};

	// async function to retrieve all dog categories from Dogs Service
	const retrieveAllDogCategories = async () => {
		setLoading(true);

		try {
			const response = await axios.get(
				`http://${orchestratorURL}/publicListDogCategories/`
			);
			const responseData = response.data;
			const sortedData = [...responseData].sort((a, b) => a.id - b.id);
			setCategories(sortedData);
		} catch (error) {
			console.error("List Dog Categories API error:", error);
			setCategories([]);
		} finally {
			setLoading(false);
		}
	};

	// function to delete dog category from data stored in state
	const handleDelete = (categoryID: number) => {
		const updatedCategories = categories?.filter(
			(category) => category.id !== categoryID
		);
		setCategories(updatedCategories);
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

	// on initial render, retrieve all dog categories
	useEffect(() => {
		retrieveAllDogCategories();
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
			<AdminNavBar header="Manage Dog Categories" setTheme={theme} />
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
												{categories && categories.length > 0 ? (
													categories
														.slice(
															page * rowsPerPage,
															page * rowsPerPage + rowsPerPage
														)
														.map((category, index) => {
															return (
																<TableRow
																	role="checkbox"
																	tabIndex={-1}
																	key={category.id}
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
																				category[column.id] !== null
																					? `${category[column.id]}`
																					: null;
																			return (
																				<TableCell
																					key={column.id}
																					align={column.align}
																				>
																					{column.id === "image" && value ? (
																						<img
																							src={value}
																							width="100"
																							height="100"
																							alt="Image"
																						/>
																					) : (
																						value
																					)}
																				</TableCell>
																			);
																		}
																	})}
																	<TableCell sx={{ width: "8%" }}>
																		<Stack spacing={2}>
																			<Button
																				variant="outlined"
																				onClick={() =>
																					handleViewCategory(category.id)
																				}
																				endIcon={
																					<PageviewOutlinedIcon fontSize="small" />
																				}
																			>
																				View
																			</Button>

																			<CategoryDeleteModal
																				categoryID={category.id}
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
															<h1>No Dog Categories Found!</h1>
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
									<TablePagination
										rowsPerPageOptions={[6]}
										component="div"
										count={categories ? categories.length : 0}
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
						onClick={handleAddCategory}
					/>
				))}
			</SpeedDial>
		</ThemeProvider>
	);
}
