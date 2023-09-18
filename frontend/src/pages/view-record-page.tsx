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

interface RecordType {
	[key: string]: any;
}

interface ParamsType {
	id: string;
}

export default function ViewRecord() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// get record ID from parameter in URL
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
	// store/set record from API
	const [record, setRecord] = useState<RecordType>();
	// enables dropdown fields
	const [selectedDog, setSelectedDog] = useState<string>("");
	// enables rating fields
	const [poop, setPoop] = useState<number>(0);
	const [reactivity, setReactivity] = useState<number>(0);
	const [sensitivity, setSensitivity] = useState<number>(0);
	// tracks/enable validation of fields
	const [dogError, setDogError] = useState<boolean>(false);
	const [maxDate, setMaxDate] = useState<string>("");
	const [handlerError, setHandlerError] = useState<boolean>(false);
	const [dateError, setDateError] = useState<boolean>(false);

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
			const entries: [string, string][] = Object.entries(dogsDict);
			entries.sort((a, b) => a[1].localeCompare(b[1]));
			setDogs(entries);
		} catch (error) {
			console.error("List Dogs API error:", error);
			setDogs([]);
		} finally {
		}
	};

	// async function to retrieve record based on record ID From Walks Service
	const retrieveWalk = async () => {
		setLoading(true);

		try {
			const response = await axios.post(`http://${orchestratorURL}/getWalk/`, {
				id: id,
			});
			const responseData = response.data;
			setRecord(responseData);
			setSelectedDog(responseData.dogID);
			responseData.poopScore ? setPoop(Number(responseData.poopScore)) : null;
			responseData.reactivityScore
				? setReactivity(Number(responseData.reactivityScore))
				: null;
			responseData.sensitivityScore
				? setSensitivity(Number(responseData.sensitivityScore))
				: null;
		} catch (error) {
			console.error("Get Record API error:", error);
		} finally {
			setLoading(false);
		}
	};

	// async function to update record from Walks Service
	const updateRecord = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setAdding(true);
		setOpenAlert(false);

		try {
			const accessToken = JSON.parse(authTokens!).access;

			const formData = new FormData(e.currentTarget);

			let valid_form = true;

			let handler = formData.get("handler") || "";
			if (handlerError || handler.length < 1 || handler.length > 100) {
				setHandlerError(true);
				valid_form = false;
			}

			let createdAt = document.getElementById("createdAt") as HTMLInputElement;
			if (!createdAt?.value) {
				setDateError(true);
				valid_form = false;
			}

			if (!selectedDog) {
				setDogError(true);
				valid_form = false;
			}

			if (!valid_form) {
				setStatus("Failed to add record!");
				setOpenAlert(true);
				return;
			}

			const response = await axios.post(
				`http://${orchestratorURL}/updateWalk/`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				setStatus("Successfully updated record!");
			} else {
				setStatus("Failed to update record!");
			}
			setOpenAlert(true);
		} catch (error) {
			console.error("Update Record API error:", error);
			setStatus("Failed to update record!");
			setOpenAlert(true);
		} finally {
			setAdding(false);
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

	// onchange event listener to enable dog dropdown field
	const handleDog = (event: SelectChangeEvent) => {
		setSelectedDog(event.target.value as string);
		setDogError(false);
	};

	// onchange event listener that validates handler:
	// - mandatory field
	// - must have between 1 and 100 alphanumeric characters
	const validateHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const handler = event.target.value as string;
		if (handler.length < 1 || handler.length > 100) {
			setHandlerError(true);
		} else {
			setHandlerError(false);
		}
	};

	// on initial render, retrieve all dogs and get list of tuples (dog ID, dog Name),
	// retrieve record based on record ID,
	// set max date of datepicker field based on current date (cannot select dates past today)
	useEffect(() => {
		retrieveAllDogs();
		retrieveWalk();
		const date = document.getElementById("createdAt");
		const maxDate = new Date();
		setMaxDate(maxDate.toISOString().slice(0, 16));
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="View Record" setTheme={theme} />
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
									<Box component="form" noValidate onSubmit={updateRecord}>
										<Stack spacing={4} justifyContent="center" direction="row">
											<TextField
												id="id"
												label="Record ID (in DB)"
												name="id"
												defaultValue={record && record.id}
												InputProps={{
													readOnly: true,
												}}
												sx={{ width: "15%" }}
											/>
											{dogs && (
												<Stack justifyContent="center" sx={{ width: "35%" }}>
													<FormControl required>
														<InputLabel id="dogID-label">Dog</InputLabel>
														<Select
															labelId="dogID-label"
															id="dogID"
															name="dogID"
															value={selectedDog}
															label="dog"
															onChange={handleDog}
															error={dogError}
														>
															{dogs.map((dog) => (
																<MenuItem key={dog[0]} value={Number(dog[0])}>
																	{dog[1]}
																</MenuItem>
															))}
														</Select>
													</FormControl>
													{dogError ? (
														<p className="error">Please select a dog.</p>
													) : null}
												</Stack>
											)}
											<TextField
												required
												id="handler"
												label="Handler"
												name="handler"
												sx={{ width: dogs ? "35%" : "85%" }}
												defaultValue={record && record.handler}
												onChange={validateHandler}
												error={handlerError}
												helperText={
													handlerError
														? "Please input a name between 1 and 100 characters."
														: null
												}
											/>
										</Stack>
										<Stack spacing={4} justifyContent="center" sx={{ mt: 4 }}>
											<TextField
												fullWidth
												id="enrichment"
												label="Enrichment"
												name="enrichment"
												multiline
												defaultValue={record && record.enrichment}
											/>
											<TextField
												fullWidth
												id="walking"
												label="Walking"
												name="walking"
												multiline
												defaultValue={record && record.walking}
											/>
											<TextField
												fullWidth
												id="leashConditioning"
												label="Leash Conditioning"
												name="leashConditioning"
												multiline
												defaultValue={record && record.leashConditioning}
											/>
											<TextField
												fullWidth
												id="touchConditioning"
												label="Touch Conditioning"
												name="touchConditioning"
												multiline
												defaultValue={record && record.touchConditioning}
											/>
											<TextField
												fullWidth
												id="muzzleConditioning"
												label="Muzzle Conditioning"
												name="muzzleConditioning"
												multiline
												defaultValue={record && record.muzzleConditioning}
											/>
											<TextField
												fullWidth
												id="behaviorIssues"
												label="Behavior Issues"
												name="behaviorIssues"
												multiline
												defaultValue={record && record.behaviorIssues}
											/>
											<TextField
												fullWidth
												id="medicalIssues"
												label="Medical Issues"
												name="medicalIssues"
												multiline
												defaultValue={record && record.medicalIssues}
											/>
										</Stack>
										<Stack
											spacing={4}
											justifyContent="space-between"
											direction="row"
											sx={{ mt: 4 }}
										>
											<Stack justifyContent="center">
												<h3>Record Taken At:</h3>
												<input
													type="datetime-local"
													id="createdAt"
													name="createdAt"
													max={maxDate}
													defaultValue={record && record.createdAt.slice(0, 16)}
													onChange={(event) => {
														if (event.target.value === "") {
															setDateError(true);
														} else {
															setDateError(false);
														}
													}}
												/>
												{dateError ? (
													<p className="error">
														Please specify when record is taken at.
													</p>
												) : null}
											</Stack>
											<Stack justifyContent="center">
												<h3>Poop Score:</h3>
												<Rating
													name="poopScore"
													value={poop}
													onChange={(event, newValue) => {
														setPoop(newValue as number);
													}}
													precision={0.5}
												/>
											</Stack>
											<Stack justifyContent="center">
												<h3>Reactivity Score:</h3>
												<Rating
													name="reactivityScore"
													value={reactivity}
													onChange={(event, newValue) => {
														setReactivity(newValue as number);
													}}
													precision={0.5}
												/>
											</Stack>
											<Stack justifyContent="center">
												<h3>Sensitivity Score:</h3>
												<Rating
													name="sensitivityScore"
													value={sensitivity}
													onChange={(event, newValue) => {
														setSensitivity(newValue as number);
													}}
													precision={0.5}
												/>
											</Stack>
										</Stack>
										<Stack
											spacing={4}
											justifyContent="center"
											direction="row"
											sx={{ mt: 4 }}
										>
											<Link to="/admin/records">
												<Button
													variant="outlined"
													endIcon={<ReplyOutlinedIcon fontSize="small" />}
												>
													Go back
												</Button>
											</Link>
											<Button
												type="submit"
												variant="outlined"
												sx={{ ml: 4 }}
												endIcon={
													<AddCircleOutlineOutlinedIcon fontSize="small" />
												}
											>
												<div>
													{adding ? "Updating... " : ""}
													{adding && <CircularProgress size={16} />}
													{!adding && "Update"}
												</div>
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
