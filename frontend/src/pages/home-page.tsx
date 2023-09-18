import { useHistory } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

import "../css/styles.css";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AdminNavBar from "../components/admin-nav-bar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import { CardActionArea } from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

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

export default function Home() {
	// get decoded token from context
	const { user } = useContext(AuthContext);

	// initialize history for routing
	const history = useHistory();

	// onClick event listener to route admin to chosen page
	const handleViewPage = (pageName: string) => {
		history.push(`/admin/${pageName}`);
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Home" setTheme={theme} />
			<main>
				<Container sx={{ py: 8 }} maxWidth="lg">
					<Grid container spacing={4} justifyContent="center">
						<Grid
							container
							spacing={4}
							justifyContent="center"
							sx={{ mt: "30vh" }}
						>
							{user && user.role === "Admin" ? (
								<Grid item xs={12} sm={6} md={4}>
									<Card
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											borderRadius: 8,
										}}
									>
										<CardActionArea onClick={() => handleViewPage("accounts")}>
											<CardContent sx={{ flexGrow: 1 }}>
												<Typography gutterBottom variant="h6" component="h6">
													Manage Accounts
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Create, view, update and delete your accounts here
												</Typography>
											</CardContent>
										</CardActionArea>
									</Card>
								</Grid>
							) : null}
							{user && (user.role === "Admin" || user.role === "Sub-Admin") ? (
								<>
									<Grid item xs={12} sm={6} md={4}>
										<Card
											sx={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
												borderRadius: 8,
											}}
										>
											<CardActionArea onClick={() => handleViewPage("dogs")}>
												<CardContent sx={{ flexGrow: 1 }}>
													<Typography gutterBottom variant="h6" component="h6">
														Manage Dogs
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Create, view, update and delete your dogs here
													</Typography>
												</CardContent>
											</CardActionArea>
										</Card>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Card
											sx={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
												borderRadius: 8,
											}}
										>
											<CardActionArea
												onClick={() => handleViewPage("dogCategories")}
											>
												<CardContent sx={{ flexGrow: 1 }}>
													<Typography gutterBottom variant="h6" component="h6">
														Manage Dog Categories
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Create, view, update and delete your dog categories
														here
													</Typography>
												</CardContent>
											</CardActionArea>
										</Card>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Card
											sx={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
												borderRadius: 8,
											}}
										>
											<CardActionArea onClick={() => handleViewPage("records")}>
												<CardContent sx={{ flexGrow: 1 }}>
													<Typography gutterBottom variant="h6" component="h6">
														Manage Records
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Create, view, update and delete your records here
													</Typography>
												</CardContent>
											</CardActionArea>
										</Card>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Card
											sx={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
												borderRadius: 8,
											}}
										>
											<CardActionArea onClick={() => handleViewPage("payments")}>
												<CardContent sx={{ flexGrow: 1 }}>
													<Typography gutterBottom variant="h6" component="h6">
														Manage Payments
													</Typography>
													<Typography variant="body2" color="text.secondary">
														View and delete your payments here
													</Typography>
												</CardContent>
											</CardActionArea>
										</Card>
									</Grid>
								</>
							) : null}
						</Grid>
					</Grid>
				</Container>
			</main>
		</ThemeProvider>
	);
}
