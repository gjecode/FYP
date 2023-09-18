import { useState, useEffect } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import axios from "axios";

import "../css/styles.css";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import PublicNavBar from "../components/public-nav-bar";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import PaginatedDogCards from "../components/paginated-dog-cards";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import GoBackButton from "../components/go-back-button";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";

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

interface DogsType {
	id: number;
	microchipID: string;
	name: string;
	desc: string;
	image: string;
	is_sponsored: boolean;
	categories: number[];
	age: number;
	gender: string;
}
interface DogsTypeArray extends Array<DogsType> {}

interface ParamsType {
	id: string;
}

interface CategoryType {
	id: number;
	name: string;
	desc: string;
}
interface CategoryTypeArray extends Array<CategoryType> {}

export default function PublicDogsByCategory() {
	// get category ID from parameter in URL
	const { id } = useParams<ParamsType>();
	// store/set dogs data to display on page based on filters
	const [dogs, setDogs] = useState<DogsTypeArray>();
	// store/set original dogs data retrieved from Dogs Service
	const [allDogs, setAllDogs] = useState<DogsTypeArray>();
	// store/set dog categories data retrieved from Dogs Service
	const [categories, setCategories] = useState<CategoryTypeArray>();
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// track filters selected by user
	const [query, setQuery] = useState<string>("");
	const [age, setAge] = useState<number[]>([0, 30]);
	const [gender, setGender] = useState<string>("");
	// track pagination
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(6);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// initialize history for routing
	const history = useHistory();

	// onClick event listener that changes page number
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	// onClick event listener that routes user to selected dog by category page
	const handleViewDog = (dogID: number) => {
		history.push(`/sosd/dogs/${dogID}`);
	};

	// onClick event listener that routes user to home page
	const handleViewDogCategories = () => {
		history.push(`/sosd`);
	};

	// onClick event listener that routes user to all dogs page
	const handleViewAllDogs = () => {
		history.push(`/sosd/dogs`);
	};

	// onClick event listener that routes user to previous page
	const handleGoBack = () => {
		history.goBack();
	};

	// async function to retrieve all dogs with category ID from Dogs Service
	const retrieveDogsByCategories = async () => {
		setLoading(true);

		const data = {
			category_id: id,
		};
		try {
			const response = await axios.post(
				`http://${orchestratorURL}/listDogsByCategories/`,
				data
			);
			const responseData = response.data;
			const sortedData = [...responseData].sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			setDogs(sortedData);
			setAllDogs(sortedData);
		} catch (error) {
			console.error("List Dogs By Categories API error:", error);
			setDogs([]);
			setAllDogs([]);
		} finally {
			setLoading(false);
		}
	};

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

	// onchange event listener to filter dogs by name
	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value;
		setQuery(query);
		if (query) {
			let filtered_dogs = allDogs?.filter((dog) =>
				dog.name.toLowerCase().includes(query.toLowerCase())
			);
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		} else {
			const filtered_dogs = allDogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		}
		setPage(1);
	};

	// onchange event listener that enables age slider
	const handleAge = (
		event: Event,
		newValue: number | number[],
		activeThumb: number
	) => {
		const minDistance = 2;
		if (!Array.isArray(newValue)) {
			return;
		}
		if (newValue[1] - newValue[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(newValue[0], 100 - minDistance);
				setAge([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(newValue[1], minDistance);
				setAge([clamped - minDistance, clamped]);
			}
		} else {
			setAge(newValue as number[]);
		}
	};

	// onClick event listener that clears all filters
	const handleClearFilters = () => {
		setQuery("");
		const searchBar = document.getElementById("search") as HTMLInputElement;
		searchBar.value = "";
		setAge([0, 30]);
		setGender("");
		setDogs(allDogs);
		setPage(1);
	};

	// onChange event listener that enables gender dropdown
	const handleGender = (event: SelectChangeEvent) => {
		setGender(event.target.value as string);
	};

	// on initial render, retrieve all dogs with category ID and all dog categories
	useEffect(() => {
		retrieveDogsByCategories();
		retrieveAllDogCategories();
	}, []);

	// if gender state changes, filters dogs by gender
	useEffect(() => {
		if (gender) {
			let filtered_dogs = allDogs?.filter((dog) => dog.gender === gender);
			if (query) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.name.toLowerCase().includes(query.toLowerCase())
				);
			}
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		} else {
			let filtered_dogs = allDogs;
			if (query) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.name.toLowerCase().includes(query.toLowerCase())
				);
			}
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		}
		setPage(1);
	}, [gender]);

	// if age state changes, filters dogs by age
	useEffect(() => {
		if (age[0] !== 0 || age[1] !== 30) {
			let filtered_dogs = allDogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			if (query) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.name.toLowerCase().includes(query.toLowerCase())
				);
			}
			setDogs(filtered_dogs);
		} else {
			let filtered_dogs = allDogs;
			if (query) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.name.toLowerCase().includes(query.toLowerCase())
				);
			}
			setDogs(filtered_dogs);
		}
		setPage(1);
	}, [age]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<PublicNavBar setTheme={theme} setTitle="SOSD Dogs By Category" />
			<main>
				<Container sx={{ pt: 8 }} maxWidth="xl">
					<Stack sx={{ mb: 4 }} spacing={4}>
						<Stack spacing={4} justifyContent="center" direction="row">
							<GoBackButton handleBack={handleGoBack} />
							<Tooltip title="View All Dogs" placement="bottom">
								<Box
									sx={{
										width: "5%",
										borderRadius: "50%",
										border: "2px solid #0d6efd",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										backgroundColor: "#fff",
										cursor: "pointer",
									}}
									onClick={handleViewAllDogs}
								>
									<AppsOutlinedIcon fontSize="large" color="primary" />
								</Box>
							</Tooltip>
							<Button
								variant="outlined"
								onClick={handleClearFilters}
								endIcon={<FilterAltOffOutlinedIcon />}
								sx={{ width: "8%" }}
							>
								Clear Filters
							</Button>
							<TextField
								id="search"
								label={
									<div style={{ display: "flex", alignItems: "flex-end" }}>
										<SearchOutlinedIcon
											fontSize="small"
											style={{ marginRight: ".5em" }}
										/>
										<span>Search for Dog by Name</span>
									</div>
								}
								variant="outlined"
								onChange={handleSearch}
								sx={{ width: "30%" }}
							/>
							<FormControl sx={{ width: "30%" }}>
								<InputLabel id="gender-label">
									<div style={{ display: "flex", alignItems: "flex-end" }}>
										<FilterAltOutlinedIcon
											fontSize="small"
											style={{ marginRight: ".5em" }}
										/>
										<span>Filter Dogs by Gender</span>
									</div>
								</InputLabel>
								<Select
									labelId="gender-label"
									id="gender"
									name="gender"
									value={gender}
									label="gendersssssssssssssssss"
									onChange={handleGender}
								>
									<MenuItem value="Male">Male</MenuItem>
									<MenuItem value="Female">Female</MenuItem>
									<MenuItem value="">None</MenuItem>
								</Select>
							</FormControl>
							<Slider
								getAriaLabel={() => "Age range"}
								value={age}
								onChange={handleAge}
								min={0}
								max={30}
								valueLabelDisplay="on"
								marks={[{ value: 15, label: "Filter Dogs by Age (Years)" }]}
								disableSwap
								sx={{ width: "30%" }}
							/>
						</Stack>
					</Stack>
				</Container>
				<Container sx={{ py: 8 }} maxWidth="md">
					<Grid container spacing={4} justifyContent="center">
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
							) : dogs && categories ? (
								<PaginatedDogCards
									page={page}
									itemsPerPage={itemsPerPage}
									dogsData={dogs}
									categories={categories}
									viewDog={handleViewDog}
								/>
							) : null}
						</Grid>
						<Stack spacing={4} justifyContent="center">
							{dogs && dogs.length > itemsPerPage ? (
								<Pagination
									count={Math.ceil(dogs.length / itemsPerPage)}
									page={page}
									onChange={handleChangePage}
									color="primary"
									sx={{
										width: "100%",
									}}
								/>
							) : null}
						</Stack>
					</Grid>
				</Container>
			</main>
		</ThemeProvider>
	);
}
