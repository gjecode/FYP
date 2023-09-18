import { Link } from "react-router-dom";
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
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Tooltip from "@mui/material/Tooltip";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";

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

const autofill_modal_style = {
	position: "absolute" as "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "40vw",
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: 4,
};

interface DogDataType {
	[key: string]: any;
}

export default function AddRecord() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// track status of adding data from API
	const [adding, setAdding] = useState<boolean>(false);
	// enables snackbar to display status after adding data
	const [openAlert, setOpenAlert] = useState(false);
	// track status of adding data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// store/set all dogs from API
	const [dogs, setDogs] = useState<[string, string][]>();
	// enables modal
	const [open, setOpen] = useState(false);
	// track status of auto fill function
	const [filling, setFilling] = useState<boolean>(false);
	// enables dropdown fields
	const [selectedDog, setSelectedDog] = useState<string>("");
	// enables rating fields
	const [poop, setPoop] = useState<number>(0);
	const [reactivity, setReactivity] = useState<number>(0);
	const [sensitivity, setSensitivity] = useState<number>(0);
	// tracks/enable validation of fields
	const [dogError, setDogError] = useState<boolean>(false);
	const [handlerError, setHandlerError] = useState<boolean>(false);
	const [dateError, setDateError] = useState<boolean>(false);
	const [autoFillError, setAutoFillError] = useState<boolean>(false);
	const [autoFillErrorMsg, setAutoFillErrorMsg] = useState<string>("");
	// enables text fields
	const [handler, setHandler] = useState<string>("");
	const [enrichment, setEnrichment] = useState<string>("");
	const [walking, setWalking] = useState<string>("");
	const [leash, setLeash] = useState<string>("");
	const [touch, setTouch] = useState<string>("");
	const [muzzle, setMuzzle] = useState<string>("");
	const [behavior, setBehavior] = useState<string>("");
	const [medical, setMedical] = useState<string>("");
	// enables datetime field
	const [date, setDate] = useState<string>("");
	// display message for copy to clipboard autofill
	const [copyTemplateMsg, setCopyTemplateMsg] = useState<string>("Copy AutoFill Template");

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// set autofill template
	const template = `
	Dog Name: 
	Handler Name: 
	Enrichment Comments: 
	Walking Comments: 
	Leash Conditioning Comments: 
	Touch Conditioning Comments: 
	Muzzle Conditioning Comments: 
	Behavioral Issues: 
	Medical Issues: 
	Record Taken At (DD/MM/YY HHMM): 
	Poop Score (out of 5, increments of 0.5): 
	Reactivity Score (out of 5, increments of 0.5): 
	Sensitivity Score (out of 5, increments of 0.5): 
	`;

	// functions for opening/closing modal
	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
		setAutoFillError(false);
	};

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

	// async function to add record from Walks Service
	const addRecord = async (e: React.FormEvent<HTMLFormElement>) => {
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
				`http://${orchestratorURL}/addWalk/`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 201) {
				setStatus("Successfully added record!");
			} else {
				setStatus("Failed to add record!");
			}
			setOpenAlert(true);
		} catch (error) {
			console.error("Create Record API error:", error);
			setStatus("Failed to add record!");
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
		setHandler(handler);
		if (handler.length < 1 || handler.length > 100) {
			setHandlerError(true);
		} else {
			setHandlerError(false);
		}
	};

	// format date string to datetimefield format
	const formatDate = (inputDate: string) => {
		const parts = inputDate.split(" ");
		const dateParts = parts[0].split("/");
		const timeParts = parts[1].split("");

		const year = "20" + dateParts[2];
		const month = dateParts[1].padStart(2, "0");
		const day = dateParts[0].padStart(2, "0");

		const hours = timeParts[0] + timeParts[1];
		const minutes = timeParts[2] + timeParts[3];

		const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

		return formattedDate;
	};

	// copies text to clipboard
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
	};

	// function to enable auto fill function
	const autoFill = () => {
		setAutoFillError(false);
		setFilling(true);

		const inputText = (document.getElementById("autofill") as HTMLInputElement)
			?.value;

		const fields = [
			"Dog Name",
			"Handler Name",
			"Enrichment Comments",
			"Walking Comments",
			"Leash Conditioning Comments",
			"Touch Conditioning Comments",
			"Muzzle Conditioning Comments",
			"Behavioral Issues",
			"Medical Issues",
			"Record Taken At",
			"Poop Score",
			"Reactivity Score",
			"Sensitivity Score",
		];
		const missingFields = [];
		for (let field of fields) {
			if (inputText.search(field) === -1) {
				missingFields.push(field);
			}
		}
		if (missingFields.length > 0) {
			setAutoFillError(true);
			setAutoFillErrorMsg(
				`The following fields are missing in the auto fill template: ${missingFields.join(
					", "
				)}`
			);
			setFilling(false);
			return;
		}

		const mappedFields: string[][] = [];
		const parsedText = inputText.split(/\n/).map((field) => {
			mappedFields.push(field.split(":").map((item) => item.trim()));
		});

		const dogName = mappedFields.find((item) => item[0] === "Dog Name") || [
			"",
			"",
		];
		const dogID = dogs?.filter(
			(dog) => dog[1].toLowerCase() === dogName[1].toLowerCase()
		);
		dogID && dogID.length > 0 && setSelectedDog(dogID[0][0]);

		const handler = mappedFields.find((item) => item[0] === "Handler Name") || [
			"",
			"",
		];
		handler[1].length > 0 && setHandler(handler[1]);

		const enrichment = mappedFields.find(
			(item) => item[0] === "Enrichment Comments"
		) || ["", ""];
		enrichment[1].length > 0 && setEnrichment(enrichment[1]);

		const walking = mappedFields.find(
			(item) => item[0] === "Walking Comments"
		) || ["", ""];
		walking[1].length > 0 && setWalking(walking[1]);

		const leash = mappedFields.find(
			(item) => item[0] === "Leash Conditioning Comments"
		) || ["", ""];
		leash[1].length > 0 && setLeash(leash[1]);

		const touch = mappedFields.find(
			(item) => item[0] === "Touch Conditioning Comments"
		) || ["", ""];
		touch[1].length > 0 && setTouch(touch[1]);

		const muzzle = mappedFields.find(
			(item) => item[0] === "Muzzle Conditioning Comments"
		) || ["", ""];
		muzzle[1].length > 0 && setMuzzle(muzzle[1]);

		const behavior = mappedFields.find(
			(item) => item[0] === "Behavioral Issues"
		) || ["", ""];
		behavior[1].length > 0 && setBehavior(behavior[1]);

		const medical = mappedFields.find(
			(item) => item[0] === "Medical Issues"
		) || ["", ""];
		medical[1].length > 0 && setMedical(medical[1]);

		try {
			const date = mappedFields.find(
				(item) => item[0] === "Record Taken At (DD/MM/YY HHMM)"
			) || ["", ""];
			date[1].length > 0 && setDate(formatDate(date[1]));
		} catch {}

		try {
			const poop = mappedFields.find(
				(item) => item[0] === "Poop Score (out of 5, increments of 0.5)"
			) || ["", ""];
			poop[1].length > 0
				? parseFloat(poop[1]) >= 0 && parseFloat(poop[1]) <= 5
					? setPoop(parseFloat(poop[1]))
					: null
				: null;
		} catch {}

		try {
			const reactivity = mappedFields.find(
				(item) => item[0] === "Reactivity Score (out of 5, increments of 0.5)"
			) || ["", ""];
			reactivity[1].length > 0
				? parseFloat(reactivity[1]) >= 0 && parseFloat(reactivity[1]) <= 5
					? setReactivity(parseFloat(reactivity[1]))
					: null
				: null;
		} catch {}

		try {
			const sensitivity = mappedFields.find(
				(item) => item[0] === "Sensitivity Score (out of 5, increments of 0.5)"
			) || ["", ""];
			sensitivity[1].length > 0
				? parseFloat(sensitivity[1]) >= 0 && parseFloat(sensitivity[1]) <= 5
					? setSensitivity(parseFloat(sensitivity[1]))
					: null
				: null;
		} catch {}

		setFilling(false);
	};

	// on initial render, retrieve all dogs and get list of tuples (dog ID, dog Name)
	useEffect(() => {
		retrieveAllDogs();
		const date = document.getElementById("createdAt");
		const maxDate = new Date();
		date?.setAttribute("max", maxDate.toISOString().slice(0, 16));
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Add Record" setTheme={theme} />
			<main>
				<Container sx={{ py: 8 }} maxWidth="md">
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
							<Box component="form" noValidate onSubmit={addRecord}>
								<Stack spacing={4} justifyContent="center" direction="row">
									{dogs && (
										<Stack justifyContent="center" sx={{ width: "50%" }}>
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
										value={handler}
										sx={{ width: dogs ? "50%" : "100%" }}
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
										value={enrichment}
									/>
									<TextField
										fullWidth
										id="walking"
										label="Walking"
										name="walking"
										multiline
										value={walking}
									/>
									<TextField
										fullWidth
										id="leashConditioning"
										label="Leash Conditioning"
										name="leashConditioning"
										multiline
										value={leash}
									/>
									<TextField
										fullWidth
										id="touchConditioning"
										label="Touch Conditioning"
										name="touchConditioning"
										multiline
										value={touch}
									/>
									<TextField
										fullWidth
										id="muzzleConditioning"
										label="Muzzle Conditioning"
										name="muzzleConditioning"
										multiline
										value={muzzle}
									/>
									<TextField
										fullWidth
										id="behaviorIssues"
										label="Behavior Issues"
										name="behaviorIssues"
										multiline
										value={behavior}
									/>
									<TextField
										fullWidth
										id="medicalIssues"
										label="Medical Issues"
										name="medicalIssues"
										multiline
										value={medical}
									/>
								</Stack>
								<Stack
									spacing={4}
									justifyContent="space-between"
									direction="row"
									sx={{ mt: 4 }}
								>
									<Stack justifyContent="center">
										<h3>Record Taken At: *</h3>
										<input
											type="datetime-local"
											id="createdAt"
											name="createdAt"
											value={date}
											onChange={(event) => {
												if (event.target.value === "") {
													setDateError(true);
												} else {
													setDateError(false);
												}
												setDate(event.target.value);
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
										variant="outlined"
										sx={{ ml: 4 }}
										endIcon={<UploadOutlinedIcon fontSize="small" />}
										onClick={handleOpen}
									>
										<div>Auto Fill</div>
									</Button>
									<Button
										type="submit"
										variant="outlined"
										sx={{ ml: 4 }}
										endIcon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
									>
										<div>
											{adding ? "Adding... " : ""}
											{adding && <CircularProgress size={16} />}
											{!adding && "Add"}
										</div>
									</Button>
								</Stack>
							</Box>
						</Paper>
					</Box>
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
			<Modal
				aria-labelledby="autofill-modal"
				aria-describedby="autofill-modal-description"
				open={open}
				onClose={handleClose}
				closeAfterTransition
				slots={{ backdrop: Backdrop }}
				slotProps={{
					backdrop: {
						timeout: 500,
					},
				}}
			>
				<Fade in={open}>
					<Box sx={autofill_modal_style}>
						<Typography id="autofill-modal" variant="h6" component="h2">
							Notice
						</Typography>
						<Typography id="autofill-modal-description" sx={{ mt: 4 }}>
							Please paste your text below to auto fill the fields:
						</Typography>
						<TextField
							fullWidth
							id="autofill"
							label="Input Text Here"
							name="autofill"
							multiline
							sx={{ mt: 2 }}
							error={autoFillError}
							helperText={
								autoFillError ? (
									<span className="error">{autoFillErrorMsg}</span>
								) : null
							}
						/>
						<br></br>
						<Stack justifyContent="space-around" direction="row" sx={{ mt: 4 }}>
							<Button
								onClick={() => setOpen(false)}
								variant="outlined"
								color="secondary"
								endIcon={<CancelOutlinedIcon fontSize="small" />}
							>
								Cancel
							</Button>
							<Tooltip
								title="Copy Auto Fill Template To Clipboard"
								placement="bottom"
							>
								<Button
									onClick={() => {
										copyToClipboard(template);
										setCopyTemplateMsg("Copied!")
										setTimeout(function () {
											setCopyTemplateMsg("Copy AutoFill Template");
										}, 1000);
									}}
									variant="outlined"
									color="primary"
									endIcon={<ContentPasteOutlinedIcon fontSize="small" />}
								>
									{copyTemplateMsg}
								</Button>
							</Tooltip>
							<Button
								onClick={autoFill}
								variant="outlined"
								color="primary"
								endIcon={<UploadOutlinedIcon fontSize="small" />}
							>
								<div>
									{filling ? "Filling... " : ""}
									{filling && <CircularProgress size={16} />}
									{!filling && "Auto Fill"}
								</div>
							</Button>
						</Stack>
					</Box>
				</Fade>
			</Modal>
		</ThemeProvider>
	);
}
