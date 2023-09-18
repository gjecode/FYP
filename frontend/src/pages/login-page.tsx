import { useState, forwardRef, SyntheticEvent, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const defaultTheme = createTheme();

export default function LoginPage() {
	// imports loginUser function and checks if user is already login-ed
	let { loginUser, user } = useContext(AuthContext);
	// track status of deleting data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// enables snackbar to display status after deleting data
	const [openAlert, setOpenAlert] = useState(false);

	// initialize history for routing
	const history = useHistory();

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

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

	useEffect(() => {
		if (user) {
			history.push("/admin/home");
		}
	});

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
		<ThemeProvider theme={defaultTheme}>
			<Grid container component="main" sx={{ height: "100vh" }}>
				<CssBaseline />
				<Grid
					item
					xs={false}
					sm={4}
					md={7}
					sx={{
						backgroundImage:
							"url(https://img.freepik.com/premium-vector/freelance-sticker-logo-icon-vector-man-with-desktop-blogger-with-laptop-icon-vector-isolated-background-eps-10_399089-1098.jpg)",
						backgroundRepeat: "no-repeat",
						backgroundColor: (t) =>
							t.palette.mode === "light"
								? t.palette.grey[50]
								: t.palette.grey[900],
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				/>
				<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
					<Box
						sx={{
							my: 8,
							mx: 4,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
							<LockOutlinedIcon />
						</Avatar>
						<Typography component="h1" variant="h5">
							SOSD Admin
						</Typography>
						<Box
							component="form"
							noValidate
							onSubmit={(e) => loginUser(e, setStatus)}
							sx={{ mt: 1 }}
						>
							<TextField
								margin="normal"
								required
								fullWidth
								id="username"
								label="Username"
								name="username"
								autoFocus
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								name="password"
								label="Password"
								type="password"
								id="password"
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								name="otp"
								label="OTP"
								id="otp"
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
							>
								Sign In
							</Button>
						</Box>
					</Box>
				</Grid>
			</Grid>
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
