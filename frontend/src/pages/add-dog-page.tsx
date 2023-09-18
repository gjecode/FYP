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
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import Container from "@mui/material/Container";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

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

interface CategoryType {
	id: number;
	name: string;
	desc: string;
}
interface CategoryTypeArray extends Array<CategoryType> {}

interface DogDataType {
	[key: string]: any;
}

export default function AddDog() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// track status of adding data from API
	const [adding, setAdding] = useState<boolean>(false);
	// enables snackbar to display status after adding data
	const [openAlert, setOpenAlert] = useState(false);
	// track status of adding data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// store/set dog categories data
	const [categories, setCategories] = useState<CategoryTypeArray>();
	// enables dropdown fields
	const [selectedCat, setSelectedCat] = useState<number[]>([]);
	const [gender, setGender] = useState<string>("");
	// tracks/enables validation of fields
	const [nameError, setNameError] = useState<boolean>(false);
	const [descError, setDescError] = useState<boolean>(false);
	const [imageError, setImageError] = useState<boolean>(false);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// async function to retrieve all dog categories from Dogs Service
	const retrieveAllDogCategories = async () => {
		try {
			const response = await axios.get(
				`http://${orchestratorURL}/publicListDogCategories/`
			);
			const responseData = response.data;
			setCategories(responseData);
		} catch (error) {
			console.error("List Dog Categories API error:", error);
		} finally {
		}
	};

	// onchange event listener that enables category dropdown field
	const handleCategory = (event: SelectChangeEvent<typeof selectedCat>) => {
		const {
			target: { value },
		} = event;
		const selectedValues = Array.isArray(value)
			? value.map(Number)
			: [Number(value)];
		setSelectedCat(selectedValues);
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

	// async function to check if dog already exists in DB based on combination of
	// name and microchip ID, returns True if dog exists, else False
	const checkIfDogExists = async (dogData: DogDataType) => {
		const response = await axios.post(
			`http://${orchestratorURL}/dogExists/`,
			dogData
		);

		if (response.status === 200) {
			if ("success" in response.data) {
				return true;
			}
			return false;
		}
	};

	// async function to add dog from Dogs Service
	const addDog = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setAdding(true);
		setOpenAlert(false);

		try {
			const accessToken = JSON.parse(authTokens!).access;

			const formData = new FormData(e.currentTarget);

			let valid_form = true;

			let name = formData.get("name") || "";
			if (nameError || name.length < 1 || name.length > 50) {
				setNameError(true);
				valid_form = false;
			}

			let desc = formData.get("desc") || "";
			if (descError || desc.length > 500) {
				setDescError(true);
				valid_form = false;
			}

			if (imageError) {
				valid_form = false;
			}

			if (!valid_form) {
				setStatus("Failed to add dog!");
				setOpenAlert(true);
				return;
			}

			const dogData = {
				name: formData.get("name"),
				microchipID: formData.get("microchipID"),
			};
			const dog_exists = await checkIfDogExists(dogData);
			if (!dog_exists) {
				const imageInput = document.getElementById("image") as HTMLInputElement;
				const image =
					imageInput && imageInput.files && imageInput.files.length > 0
						? imageInput.files[0]
						: null;
				image !== null ? formData.append("image", image) : null;
				// for (const pair of formData.entries()) {
				// 	console.log(pair);
				// }

				const response = await axios.post(
					`http://${orchestratorURL}/addDog/`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				if (response.status === 201) {
					setStatus("Successfully added dog!");
				} else {
					setStatus("Failed to add dog!");
				}
				setOpenAlert(true);
			} else {
				setStatus("Dog already exists!");
				setOpenAlert(true);
			}
		} catch (error) {
			console.error("Create Dog API error:", error);
			setStatus("Failed to add dog!");
			setOpenAlert(true);
		} finally {
			setAdding(false);
		}
	};

	// onchange event listener that enables gender dropdown field
	const handleGender = (event: SelectChangeEvent) => {
		setGender(event.target.value as string);
	};

	// onchange event listener that validates name:
	// - mandatory field
	// - must have between 1 and 50 alphanumeric characters
	const validateName = (event: React.ChangeEvent<HTMLInputElement>) => {
		const name = event.target.value as string;
		if (name.length < 1 || name.length > 50) {
			setNameError(true);
		} else {
			setNameError(false);
		}
	};

	// onchange event listener that validates description:
	// - maximum of 499 alphanumeric characters
	const validateDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
		const desc = event.target.value as string;
		if (desc.length > 500) {
			setDescError(true);
		} else {
			setDescError(false);
		}
	};

	// onchange event listener that validates image:
	// - file uploaded must have MIME type of image
	const validateImage = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files ? event.target.files[0] : null;
		if (file && file.type.startsWith("image/")) {
			setImageError(false);
		} else {
			setImageError(true);
		}
	};

	// on initial render, retrieve all dog categories,
	// set max date of datepicker field based on current date (cannot select dates past today)
	useEffect(() => {
		retrieveAllDogCategories();
		const date = document.getElementById("DOB");
		const maxDate = new Date();
		maxDate.setDate(maxDate.getDate());
		date?.setAttribute("max", maxDate.toISOString().split("T")[0]);
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Add Dog" setTheme={theme} />
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
							<Box component="form" noValidate onSubmit={addDog}>
								<Stack spacing={4} justifyContent="center">
									<Stack spacing={4} justifyContent="center" direction="row">
										<TextField
											required
											id="name"
											label="Name"
											name="name"
											onChange={validateName}
											error={nameError}
											helperText={
												nameError
													? "Please input a name between 1 and 50 characters."
													: null
											}
											sx={{ width: "40%" }}
										/>
										<TextField
											id="microchipID"
											label="Microchip ID"
											name="microchipID"
											sx={{ width: "60%" }}
										/>
									</Stack>
									<Stack
										spacing={4}
										justifyContent="space-between"
										direction="row"
									>
										<FormControl sx={{ width: "20%" }}>
											<InputLabel id="gender-label">Gender</InputLabel>
											<Select
												labelId="gender-label"
												id="gender"
												name="gender"
												value={gender}
												label="gender"
												onChange={handleGender}
											>
												<MenuItem value="Male">Male</MenuItem>
												<MenuItem value="Female">Female</MenuItem>
											</Select>
										</FormControl>
										<TextField
											margin="normal"
											fullWidth
											id="desc"
											label="Description"
											name="desc"
											onChange={validateDesc}
											error={descError}
											helperText={
												descError
													? "Please input a description with maximum of 500 characters."
													: null
											}
											sx={{ width: "80%" }}
											multiline
										/>
									</Stack>
									{categories && (
										<FormControl fullWidth>
											<InputLabel id="categories-label">Categories</InputLabel>
											<Select
												labelId="categories-label"
												id="categories"
												name="categories"
												multiple
												value={selectedCat}
												onChange={handleCategory}
												input={<OutlinedInput label="Tagssssss" />}
												renderValue={(selected) =>
													categories
														.filter((category) =>
															selected.includes(category.id)
														)
														.map((category) => category.name)
														.join(", ")
												}
											>
												{Object.values(categories).map((category) => (
													<MenuItem key={category.name} value={category.id}>
														<Checkbox
															checked={selectedCat.indexOf(category.id) > -1}
														/>
														<ListItemText primary={category.name} />
													</MenuItem>
												))}
											</Select>
										</FormControl>
									)}
									<Stack
										spacing={4}
										justifyContent="space-between"
										direction="row"
									>
										<Stack justifyContent="center" sx={{ width: "30%" }}>
											<h3>Upload New Image:</h3>
											<input
												type="file"
												accept="image/*"
												name="image"
												id="image"
												onChange={validateImage}
											/>
											{imageError ? (
												<p className="error">
													Please upload a valid image file.
												</p>
											) : null}
										</Stack>
										<Stack justifyContent="center" sx={{ width: "33%" }}>
											<h3>Date of Birth:</h3>
											<input
												type="date"
												id="DOB"
												name="DOB"
												style={{ width: "80%" }}
											/>
										</Stack>
										<Stack justifyContent="center" sx={{ width: "33%" }}>
											<h3>Vaccination Date:</h3>
											<input
												type="date"
												id="vaccinationDate"
												name="vaccinationDate"
												style={{ width: "80%" }}
											/>
										</Stack>
									</Stack>
								</Stack>
								<Stack
									spacing={4}
									justifyContent="center"
									direction="row"
									sx={{ mt: 4 }}
								>
									<Link to="/admin/dogs">
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
		</ThemeProvider>
	);
}
