import { useParams, Link } from "react-router-dom";
import {
	useContext,
	useState,
	useEffect,
	forwardRef,
	SyntheticEvent,
} from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

import "../css/styles.css";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import AdminNavBar from "../components/admin-nav-bar";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
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
	image: string;
}

interface ParamsType {
	id: string;
}

interface DogDataType {
	[key: string]: any;
}

export default function ViewDogCategory() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// get dog ID from parameter in URL
	const { id } = useParams<ParamsType>();
	// store/set dog category data to display on page
	const [category, setCategory] = useState<CategoryType>();
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// track status of updating data from API
	const [updating, setUpdating] = useState<boolean>(false);
	// enables snackbar to display status after updating data
	const [openAlert, setOpenAlert] = useState(false);
	// track status of updating data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// tracks/enables validation of fields
	const [nameError, setNameError] = useState<boolean>(false);
	const [descError, setDescError] = useState<boolean>(false);
	const [imageError, setImageError] = useState<boolean>(false);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// function that enables snackbar to display status after updating data
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

	// async function to retrieve dog category with category ID from Dogs Service
	const retrieveDogCategory = async () => {
		setLoading(true);

		try {
			const response = await axios.post(
				`http://${orchestratorURL}/getDogCategory/`,
				{
					id: id,
				}
			);
			const responseData = response.data;
			setCategory(responseData);
		} catch (error) {
			console.error("Get Dog Category API error:", error);
		} finally {
			setLoading(false);
		}
	};

	// async function to check if dog category already exists in DB based on
	// name, returns True if dog category exists, else False
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

	// async function to update dog category with category ID from Dogs Service
	const updateDogCategory = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setUpdating(true);
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
				setStatus("Failed to update dog category!");
				setOpenAlert(true);
				return;
			}

			const dogData = {
				name: formData.get("name"),
			};
			let dog_category_exists: boolean = false;
			if (category && category.name !== dogData.name) {
				const result = await checkIfDogCategoryExists(dogData);
				if (result !== undefined) {
					dog_category_exists = result;
				}
			}
			if (!dog_category_exists) {
				const imageInput = document.getElementById("image") as HTMLInputElement;
				const image =
					imageInput && imageInput.files && imageInput.files.length > 0
						? imageInput.files[0]
						: null;
				image !== null ? formData.append("image", image) : null;

				const response = await axios.post(
					`http://${orchestratorURL}/updateDogCategory/`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				const responseData = response.data;
				if (response.status === 200) {
					setCategory(responseData);
					setStatus("Successfully updated dog category!");
				} else {
					setStatus("Failed to update dog category!");
				}
				setOpenAlert(true);
			} else {
				setStatus("Dog category already exists!");
				setOpenAlert(true);
			}
		} catch (error) {
			console.error("Update Dog Category API error:", error);
			setStatus("Failed to update dog category!");
			setOpenAlert(true);
		} finally {
			setUpdating(false);
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

	// on initial render, retrieve dog category with category ID
	useEffect(() => {
		retrieveDogCategory();
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="View Dog Category" setTheme={theme} />
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
							<>
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
										<Box
											component="form"
											noValidate
											onSubmit={updateDogCategory}
										>
											<Stack spacing={4} justifyContent="center">
												<Stack
													spacing={4}
													justifyContent="center"
													direction="row"
												>
													<TextField
														id="id"
														label="ID (in DB)"
														name="id"
														defaultValue={category && category.id}
														InputProps={{
															readOnly: true,
														}}
														sx={{ width: "15%" }}
													/>
													<TextField
														required
														id="name"
														label="Name"
														name="name"
														defaultValue={category && category.name}
														onChange={validateName}
														error={nameError}
														helperText={
															nameError
																? "Please input a name between 1 and 100 characters."
																: null
														}
														sx={{ width: "85%" }}
														multiline
													/>
												</Stack>
												<Stack>
													<TextField
														id="desc"
														label="Description"
														name="desc"
														defaultValue={category && category.desc}
														onChange={validateDesc}
														error={descError}
														helperText={
															descError
																? "Please input a description with maximum of 500 characters."
																: null
														}
														multiline
													/>
												</Stack>
												<Stack
													spacing={4}
													justifyContent={
														category && category.image
															? "space-around"
															: "flex-start"
													}
													direction="row"
												>
													{category && category.image ? (
														<Stack justifyContent="center">
															<h3>Current Image:</h3>
															<img
																src={category.image}
																width="350"
																height="250"
																id="currentImg"
															/>
														</Stack>
													) : null}
													<Stack spacing={4} justifyContent="center">
														<Stack justifyContent="center">
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
													</Stack>
												</Stack>
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
													endIcon={
														<AddCircleOutlineOutlinedIcon fontSize="small" />
													}
												>
													<div>
														{updating ? "Updating... " : ""}
														{updating && <CircularProgress size={16} />}
														{!updating && "Update"}
													</div>
												</Button>
											</Stack>
										</Box>
									</Paper>
								</Box>
							</>
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
