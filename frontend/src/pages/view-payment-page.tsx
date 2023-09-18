import { useParams, Link } from "react-router-dom";
import {
	useContext,
	useState,
	forwardRef,
	SyntheticEvent,
	useEffect,
} from "react";
import axios from "axios";
import React from "react";
import AuthContext from "../context/AuthContext";

import "../css/styles.css";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import AdminNavBar from "../components/admin-nav-bar";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import Container from "@mui/material/Container";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import Rating from "@mui/material/Rating";
import Grid from "@mui/material/Grid";
import PageviewOutlinedIcon from "@mui/icons-material/PageviewOutlined";

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

interface DogDataType {
	[key: string]: any;
}

interface PaymentType {
	[key: string]: any;
}

interface ParamsType {
	id: string;
}

export default function ViewPayment() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// get payment ID from parameter in URL
	const { id } = useParams<ParamsType>();
	// track status of adding data from API
	const [adding, setAdding] = useState<boolean>(false);
	// enables snackbar to display status after adding data
	const [openAlert, setOpenAlert] = useState(false);
	// track status of adding data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// tracks status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// store/set all dogs from API
	const [dogs, setDogs] = useState<[string, string][]>();
	// store/set payment from API
	const [payment, setPayment] = useState<PaymentType>();

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// async function to retrieve all dogs and get list of tuples (dog ID, dog Name)
	const retrieveAllDogs = async () => {
		try {
			const response = await axios.get(
				`http://${orchestratorURL}/publicListDogs/`
			);
			const responseData = response.data;
			const dogsDict = responseData
				.filter((obj: DogDataType) => obj.id && obj.name)
				.reduce((result: DogDataType, obj: DogDataType) => {
					result[obj.id] = obj.name;
					return result;
				}, {});
			setDogs(dogsDict);
		} catch (error) {
			console.error("List Dogs API error:", error);
			setDogs([]);
		} finally {
		}
	};

	// async function to retrieve payment based on payment intent From Payment Service
	const retrievePayment = async () => {
		setLoading(true);

		try {
			const accessToken = JSON.parse(authTokens!).access;

			const response = await axios.post(
				`http://${orchestratorURL}/getPayment/`,
				{
					id: id,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			const responseData = response.data;
			setPayment(responseData);
		} catch (error) {
			console.error("Get Payment API error:", error);
		} finally {
			setLoading(false);
		}
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

	// function that re-formats money
	const formatMoney = (moneyString: string) => {
		return `${moneyString.slice(0, 2)}.${moneyString.slice(2, 4)}` 
	}

	// on initial render, retrieve all dogs and get mapping of Dog ID to Dog Name,
	// and retrieve payment based on payment intent,
	useEffect(() => {
		retrieveAllDogs();
		retrievePayment();
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="View Payment" setTheme={theme} />
			<main>
				<Container sx={{ py: 8 }} maxWidth="md">
					<Grid container spacing={2} justifyContent="center">
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
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									width: "50vw",
								}}
							>
								<Paper
									elevation={3}
									sx={{
										p: 5,
										width: "100%",
										borderRadius: 4,
										backgroundColor: "#FFFFF0",
									}}
								>
									<Box>
										<Stack spacing={4} justifyContent="center" direction="row">
											<TextField
												id="paymentIntent"
												label="Payment Intent"
												name="paymentIntent"
												sx={{ width: "50%" }}
												defaultValue={payment && payment.paymentIntent}
												InputProps={{
													readOnly: true,
												}}
											/>
											<TextField
												id="dogID"
												label="Dog ID (in DB)"
												name="dogID"
												sx={{ width: "15%" }}
												defaultValue={payment && payment.dogID}
												InputProps={{
													readOnly: true,
												}}
											/>
											<TextField
												id="dogName"
												label="Dog Name"
												name="dogName"
												sx={{ width: "35%" }}
												defaultValue={
													payment && dogs && dogs[Number(payment.dogID)]
												}
												InputProps={{
													readOnly: true,
												}}
											/>
										</Stack>
										<Stack
											spacing={4}
											justifyContent="center"
											direction="row"
											sx={{ mt: 4 }}
										>
											<TextField
												fullWidth
												id="checkoutSessionID"
												label="Checkout Session ID"
												name="checkoutSessionID"
												defaultValue={payment && payment.checkoutSessionID}
												InputProps={{
													readOnly: true,
												}}
											/>
										</Stack>
										<Stack
											spacing={4}
											justifyContent="center"
											direction="row"
											sx={{ mt: 4 }}
										>
											<TextField
												id="customerEmail"
												label="Sponsor Email"
												name="customerEmail"
												sx={{ width: "50%" }}
												defaultValue={payment && payment.customerEmail}
												InputProps={{
													readOnly: true,
												}}
											/>
											<TextField
												fullWidth
												id="customerName"
												label="Sponsor Name"
												name="customerName"
												sx={{ width: "50%" }}
												defaultValue={payment && payment.customerName}
												InputProps={{
													readOnly: true,
												}}
											/>
										</Stack>
										<Stack
											spacing={4}
											justifyContent="center"
											direction="row"
											sx={{ mt: 4 }}
										>
											<TextField
												fullWidth
												id="currency"
												label="Currency"
												name="currency"
												sx={{ width: "15%" }}
												defaultValue={payment && payment.currency}
												InputProps={{
													readOnly: true,
												}}
											/>
											<TextField
												id="amountTotal"
												label="Amount Paid (in Dollars)"
												name="amountTotal"
												sx={{ width: "35%" }}
												defaultValue={payment && formatMoney(payment.amountTotal)}
												InputProps={{
													readOnly: true,
												}}
											/>
											<TextField
												fullWidth
												id="createdAt"
												label="Created At"
												name="createdAt"
												sx={{ width: "50%" }}
												defaultValue={payment && formatDate(payment.createdAt)}
												InputProps={{
													readOnly: true,
												}}
											/>
										</Stack>
										<Stack
											spacing={4}
											justifyContent="center"
											direction="row"
											sx={{ mt: 4 }}
										>
											<Link to="/admin/payments">
												<Button
													variant="outlined"
													endIcon={<ReplyOutlinedIcon fontSize="small" />}
												>
													Go back
												</Button>
											</Link>
											<Button
													variant="outlined"
													sx={{ml:4}}
													onClick={() => {
														window.open(`https://dashboard.stripe.com/test/payments/${id}`, "_blank");
													}}
													endIcon={<PageviewOutlinedIcon fontSize="small" />}
												>
													View on Stripe
											</Button>
										</Stack>
									</Box>
								</Paper>
							</Box>
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
