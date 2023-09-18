import { Link } from "react-router-dom";
import { useContext, useState, forwardRef, SyntheticEvent } from "react";
import axios from "axios";
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

interface DogDataType {
	[key: string]: any;
}

export default function AddDogCategory() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// track status of adding data from API
	const [adding, setAdding] = useState<boolean>(false);
	// enables snackbar to display status after adding data
	const [openAlert, setOpenAlert] = useState(false);
	// track status of adding data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// tracks/enables validation of fields
	const [nameError, setNameError] = useState<boolean>(false);
	const [descError, setDescError] = useState<boolean>(false);
	const [imageError, setImageError] = useState<boolean>(false);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

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

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// async function to check if dog category already exists in DB based on
	// name, returns True if dog exists, else False
	const checkIfDogCategoryExists = async (dogData: DogDataType) => {
		const response = await axios.post(
			`http://${orchestratorURL}/dogCategoryExists/`,
			dogData
		);

		if (response.status === 200) {
			if ("success" in response.data) {
				return true;
			}
			return false;
		}
	};

	// async function to add dog category from Dogs Service
	const addDogCategory = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setAdding(true);
		setOpenAlert(false);

		try {
			const accessToken = JSON.parse(authTokens!).access;

			const formData = new FormData(e.currentTarget);

			let valid_form = true;

			let name = formData.get("name") || "";
			if (nameError || name.length < 1 || name.length > 100) {
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
				setStatus("Failed to add dog category!");
				setOpenAlert(true);
				return;
			}

			const dogData = {
				name: formData.get("name"),
			};
			const dog_category_exists = await checkIfDogCategoryExists(dogData);
			if (!dog_category_exists) {
				const imageInput = document.getElementById("image") as HTMLInputElement;
				const image =
					imageInput && imageInput.files && imageInput.files.length > 0
						? imageInput.files[0]
						: null;
				image !== null ? formData.append("image", image) : null;
				const response = await axios.post(
					`http://${orchestratorURL}/addDogCategory/`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				if (response.status === 201) {
					setStatus("Successfully added dog category!");
				} else {
					setStatus("Failed to add dog category!");
				}
				setOpenAlert(true);
			} else {
				setStatus("Dog Category already exists!");
				setOpenAlert(true);
			}
		} catch (error) {
			console.error("Create Dog Category API error:", error);
			setStatus("Failed to add dog category!");
			setOpenAlert(true);
		} finally {
			setAdding(false);
		}
	};

	// onchange event listener that validates name:
	// - mandatory field
	// - must have between 1 and 100 alphanumeric characters
	const validateName = (event: React.ChangeEvent<HTMLInputElement>) => {
		const name = event.target.value as string;
		if (name.length < 1 || name.length > 100) {
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

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Add Dog Category" setTheme={theme} />
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
							<Box component="form" noValidate onSubmit={addDogCategory}>
								<Stack spacing={4} justifyContent="center">
									<TextField
										margin="normal"
										fullWidth
										required
										id="name"
										label="Name"
										name="name"
										onChange={validateName}
										error={nameError}
										helperText={
											nameError
												? "Please input a name between 1 and 100 characters."
												: null
										}
									/>
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
									/>
								</Stack>
								<Stack justifyContent="center" sx={{ mt: 4 }}>
									<h3>Upload Image:</h3>
									<input
										type="file"
										accept="image/*"
										name="image"
										id="image"
										onChange={validateImage}
									/>
									{imageError ? (
										<p className="error">Please upload a valid image file.</p>
									) : null}
								</Stack>
								<Stack
									spacing={4}
									justifyContent="center"
									direction="row"
									sx={{ mt: 4 }}
								>
									<Link to="/admin/dogCategories">
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
