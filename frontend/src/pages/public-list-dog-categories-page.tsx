import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";

import "../css/styles.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import PublicNavBar from "../components/public-nav-bar";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { CardActionArea } from "@mui/material";

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

interface CategoryTypeArray extends Array<CategoryType> {}

export default function PublicDogCategories() {
	// store/set dog categories data retrieved from Dogs Service
	const [categories, setCategories] = useState<CategoryTypeArray>();
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// track pagination
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(6);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// initialize history for routing
	const history = useHistory();

	// async function to get all dog categories
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

	// onClick event listener that changes page number
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	// onClick event listener that routes user to selected dog by category page
	const handleViewCategory = (categoryID: number) => {
		history.push(`/sosd/dogs/catFilter/${categoryID}`);
	};

	// onClick event listener that routes user to all dogs page
	const handleViewAllDogs = () => {
		history.push(`/sosd/dogs`);
	};

	// on initial render, retrieve all dog categories
	useEffect(() => {
		retrieveAllDogCategories();
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<PublicNavBar setTheme={theme} setTitle="SOSD All Dog Categories" />
			<main>
				<Container sx={{ py: 8 }} maxWidth="md">
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
							<>
								<Grid
									container
									spacing={4}
									justifyContent="center"
									sx={{ mt: "10vh" }}
								>
									{categories && categories.length > 0 ? (
										categories
											.slice(
												(page - 1) * itemsPerPage,
												(page - 1) * itemsPerPage + itemsPerPage
											)
											.map((category, index) => (
												<Grid item key={index} xs={12} sm={6} md={4}>
													<Card
														sx={{
															height: "100%",
															display: "flex",
															flexDirection: "column",
															borderRadius: 8,
														}}
														id={String(category.id)}
													>
														<CardActionArea
															onClick={() => handleViewCategory(category.id)}
														>
															<CardMedia
																component="div"
																sx={{
																	pt: "56.25%",
																}}
																image={
																	category.image
																		? category.image
																		: "https://icons.veryicon.com/png/o/animal/pet-icon/dog-24.png"
																}
															/>
															<CardContent sx={{ flexGrow: 1 }}>
																<Typography
																	gutterBottom
																	variant="h6"
																	component="h6"
																>
																	{category.name}
																</Typography>

																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	{category.desc}
																</Typography>
															</CardContent>
														</CardActionArea>
													</Card>
												</Grid>
											))
									) : (
										<Grid item>
											<h1>No Dog Categories Found!</h1>
										</Grid>
									)}
								</Grid>
								<Stack
									spacing={4}
									justifyContent="center"
									sx={{
										mt: 4,
									}}
								>
									{categories && categories.length > itemsPerPage ? (
										<Pagination
											count={Math.ceil(categories.length / itemsPerPage)}
											page={page}
											onChange={handleChangePage}
											color="primary"
											sx={{
												width: "100%",
											}}
										/>
									) : null}
								</Stack>
							</>
						)}
					</Grid>
				</Container>
			</main>
		</ThemeProvider>
	);
}
