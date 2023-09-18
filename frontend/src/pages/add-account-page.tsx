import { Link } from "react-router-dom";
import { useContext, useState, forwardRef, SyntheticEvent } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";

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

export default function AddAccount() {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// track status of adding data from API
	const [adding, setAdding] = useState<boolean>(false);
	// enables snackbar to display status after adding data
	const [openAlert, setOpenAlert] = useState(false);
	// track status of adding data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// enables role dropdown field
	const [role, setRole] = useState<string>("");
	// tracks/enable validation of fields
	const [usernameError, setUsernameError] = useState<boolean>(false);
	const [usernameErrorText, setUsernameErrorText] = useState<string>("");
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [roleError, setRoleError] = useState<boolean>(false);

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

	// async function to check if account already exists in DB based on
	// username, returns True if account exists, else False
	const checkIfAccountExists = async (username_input: string) => {
		const accessToken = JSON.parse(authTokens!).access;

		const data = {
			user: username_input,
		};
		const response = await axios.post(
			`http://${orchestratorURL}/accountExists/`,
			data,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (response.status === 200) {
			if ("success" in response.data) {
				return true;
			}
			return false;
		}
	};

	// async function to add account from Account Service
	const addAccount = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setAdding(true);
		setOpenAlert(false);

		try {
			const accessToken = JSON.parse(authTokens!).access;

			const formData = new FormData(e.currentTarget);

			let valid_form = true;

			let username = (formData.get("username") as string) || "";
			const email_regex =
				/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			const is_username_valid = email_regex.test(username);
			if (usernameError || !is_username_valid) {
				setUsernameErrorText("Please enter a valid email.");
				setUsernameError(true);
				valid_form = false;
			} else {
				const account_exist = await checkIfAccountExists(username);
				if (account_exist) {
					setUsernameErrorText("User already exists.");
					setUsernameError(true);
					valid_form = false;
				}
			}

			let password = (formData.get("password") as string) || "";
			const password_regex =
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
			const is_password_valid = password_regex.test(password);
			if (passwordError || !is_password_valid) {
				setPasswordError(true);
				valid_form = false;
			}

			if (!role) {
				setRoleError(true);
				valid_form = false;
			}

			if (!valid_form) {
				setStatus("Failed to add account!");
				setOpenAlert(true);
				return;
			}

			const response = await axios.post(
				`http://${orchestratorURL}/addAccount/`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 201) {
				setStatus("Successfully added account!");
			} else {
				setStatus("Failed to add account!");
			}
			setOpenAlert(true);
		} catch (error) {
			console.error("Create Account API error:", error);
			setStatus("Failed to add account!");
			setOpenAlert(true);
		} finally {
			setAdding(false);
		}
	};

	// onchange event listener to enable role dropdown field
	const handleRole = (event: SelectChangeEvent) => {
		setRole(event.target.value as string);
		setRoleError(false);
	};

	// onchange event listener that validates username:
	// - mandatory field
	// - validate email format based on RFC 5322 Official Standard
	const validateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
		const username = event.target.value as string;
		const email_regex =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const is_valid = email_regex.test(username);
		if (is_valid) {
			setUsernameError(false);
		} else {
			setUsernameErrorText("Please enter a valid email.");
			setUsernameError(true);
		}
	};

	// onchange event listener that validates username:
	// - mandatory field
	// - validate password using the following rules
	//  -> at least one uppercase character
	//  -> at least one lowercase character
	//  -> at least one digit
	//  -> at least one special character
	//  -> minimum length of eight characters
	const validatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
		const password = event.target.value as string;
		const password_regex =
			/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
		const is_valid = password_regex.test(password);
		if (is_valid) {
			setPasswordError(false);
		} else {
			setPasswordError(true);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Add Account" setTheme={theme} />
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
							<Box component="form" noValidate onSubmit={addAccount}>
								<Stack spacing={4} justifyContent="center">
									<TextField
										margin="normal"
										fullWidth
										required
										id="username"
										label="Username"
										name="username"
										onChange={validateUsername}
										error={usernameError}
										helperText={usernameError ? usernameErrorText : null}
									/>
									<TextField
										margin="normal"
										fullWidth
										required
										id="password"
										label="Password"
										name="password"
										onChange={validatePassword}
										error={passwordError}
										helperText={
											passwordError ? (
												<span>
													Please input a password with the following criteria:
													<br />
													- At least 1 uppercase character
													<br />
													- At least 1 lowercase character
													<br />
													- At least 1 digit
													<br />
													- At least 1 special character
													<br />- Minimum length of 8 characters
												</span>
											) : null
										}
									/>
									<Stack justifyContent="center" sx={{ mt: 4 }}>
										<FormControl fullWidth required>
											<InputLabel id="role-label">Role</InputLabel>
											<Select
												labelId="role-label"
												id="role"
												name="role"
												value={role}
												label="Role"
												onChange={handleRole}
												error={roleError}
											>
												<MenuItem value="Admin">Admin</MenuItem>
												<MenuItem value="Sub-Admin">Sub-Admin</MenuItem>
												<MenuItem value="Volunteer">Volunteer</MenuItem>
											</Select>
										</FormControl>
										{roleError ? (
											<p className="error">Please select a role.</p>
										) : null}
									</Stack>
								</Stack>
								<Stack
									spacing={4}
									justifyContent="center"
									direction="row"
									sx={{ mt: 4 }}
								>
									<Link to="/admin/accounts">
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
