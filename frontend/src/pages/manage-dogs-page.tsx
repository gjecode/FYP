import {
	useState,
	useEffect,
	forwardRef,
	SyntheticEvent,
} from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import "../css/styles.css";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import AdminNavBar from "../components/admin-nav-bar";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import AdminPaginatedDogCards from "../components/admin-paginated-dog-cards";
import Pagination from "@mui/material/Pagination";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import GoBackButton from "../components/go-back-button";

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

const actions = [
	{ icon: <AddOutlinedIcon />, name: "Add Dog" },
];

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

interface CategoryType {
	id: number;
	name: string;
	desc: string;
}
interface CategoryTypeArray extends Array<CategoryType> {}

export default function ManageDogs() {
	// store/set dogs data to display on page based on filters
	const [dogs, setDogs] = useState<DogsTypeArray>();
	// store/set original dogs data retrieved from Dogs Service
	const [allDogs, setAllDogs] = useState<DogsTypeArray>();
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);
	// track status of deleting data from API to display in snackbar
	const [status, setStatus] = useState<string>("");
	// enables snackbar to display status after deleting data
	const [openAlert, setOpenAlert] = useState(false);
	// store/set dog categories data 
	const [categories, setCategories] = useState<CategoryTypeArray>();
	// track filters selected by user
	const [selectedCat, setSelectedCat] = useState<number[]>([]);
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

	// set timeout of resetting status (in ms)
	const alertTimeout = 3000;

	// onClick event listener that routes admin to view dog details page
	const handleViewDog = (dogID: number) => {
		history.push(`/admin/dogs/${dogID}`);
	};

	// onClick event listener that routes admin to add dog page
	const handleAddDog = () => {
		history.push(`/admin/addDog`);
	};

	// onClick event listener that changes page number
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	// async function to retrieve all dogs from Dogs Service
	const retrieveAllDogs = async () => {
		setLoading(true);

		try {
			const response = await axios.get(`http://${orchestratorURL}/publicListDogs/`);
			const responseData = response.data;
			const sortedData = [...responseData].sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			setDogs(sortedData);
			setAllDogs(sortedData);
		} catch (error) {
			console.error("List Dogs API error:", error);
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

	// onchange event listener to filter dogs by category
	const handleCategory = (event: SelectChangeEvent<typeof selectedCat>) => {
		const {
			target: { value },
		} = event;
		const selectedValues = Array.isArray(value)
			? value.map(Number)
			: [Number(value)];
		setSelectedCat(selectedValues);
		if (selectedValues.length > 0) {
			let filtered_dogs = allDogs?.filter((dog) =>
				dog.categories.some((category) => selectedValues.includes(category))
			);
			if (query) {
				filtered_dogs = filtered_dogs?.filter(
					(dog) =>
						dog.name.toLowerCase().includes(query.toLowerCase()) ||
						(dog.microchipID &&
							dog.microchipID.toLowerCase().includes(query.toLowerCase()))
				);
			}
			if (gender) {
				filtered_dogs = filtered_dogs?.filter((dog) => dog.gender === gender);
			}
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		} else {
			let filtered_dogs = allDogs;
			if (query) {
				filtered_dogs = filtered_dogs?.filter(
					(dog) =>
						dog.name.toLowerCase().includes(query.toLowerCase()) ||
						(dog.microchipID &&
							dog.microchipID.toLowerCase().includes(query.toLowerCase()))
				);
			}
			if (gender) {
				filtered_dogs = filtered_dogs?.filter((dog) => dog.gender === gender);
			}
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		}
		setPage(1);
	};

	// function to delete dog from data stored in state
	const handleDelete = (dogID: number) => {
		const updatedDogs = dogs?.filter((dog) => dog.id !== dogID);
		const updatedAllDogs = allDogs?.filter((dog) => dog.id !== dogID);
		setDogs(updatedDogs);
		setAllDogs(updatedAllDogs);
		setPage(1);
	};

	// function to set status after deleting data
	const handleStatus = (status: string) => {
		setStatus(status);
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

	// onchange event listener to filter dogs by name
	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value;
		setQuery(query);
		if (query) {
			let filtered_dogs = allDogs?.filter(
				(dog) =>
					dog.name.toLowerCase().includes(query.toLowerCase()) ||
					(dog.microchipID &&
						dog.microchipID.toLowerCase().includes(query.toLowerCase()))
			);
			if (selectedCat.length > 0) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.categories.some((category) => selectedCat.includes(category))
				);
			}
			if (gender) {
				filtered_dogs = filtered_dogs?.filter((dog) => dog.gender === gender);
			}
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		} else {
			let filtered_dogs = allDogs;
			if (selectedCat.length > 0) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.categories.some((category) => selectedCat.includes(category))
				);
			}
			if (gender) {
				filtered_dogs = filtered_dogs?.filter((dog) => dog.gender === gender);
			}
			filtered_dogs = filtered_dogs?.filter(
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
		setSelectedCat([]);
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

	// onClick event listener to redirect user back to previous page
	const handleBack = () => {
		history.goBack();
	};

	// on initial render, retrieve all dogs and all dog categories
	useEffect(() => {
		retrieveAllDogs();
		retrieveAllDogCategories();
	}, []);

	// if status state changes, opens snackbar and resets status
	useEffect(() => {
		if (status) {
			setOpenAlert(false);
			setOpenAlert(true);
		} else {
			setOpenAlert(false);
		}
	}, [status]);

	// if age state changes, filters dogs by age
	useEffect(() => {
		if (age[0] !== 0 || age[1] !== 30) {
			let filtered_dogs = allDogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			if (selectedCat.length > 0) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.categories.some((category) => selectedCat.includes(category))
				);
			}
			if (query) {
				filtered_dogs = filtered_dogs?.filter(
					(dog) =>
						dog.name.toLowerCase().includes(query.toLowerCase()) ||
						(dog.microchipID &&
							dog.microchipID.toLowerCase().includes(query.toLowerCase()))
				);
			}
			if (gender) {
				filtered_dogs = filtered_dogs?.filter((dog) => dog.gender === gender);
			}
			setDogs(filtered_dogs);
		} else {
			let filtered_dogs = allDogs;
			if (selectedCat.length > 0) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.categories.some((category) => selectedCat.includes(category))
				);
			}
			if (query) {
				filtered_dogs = filtered_dogs?.filter(
					(dog) =>
						dog.name.toLowerCase().includes(query.toLowerCase()) ||
						(dog.microchipID &&
							dog.microchipID.toLowerCase().includes(query.toLowerCase()))
				);
			}
			if (gender) {
				filtered_dogs = filtered_dogs?.filter((dog) => dog.gender === gender);
			}
			setDogs(filtered_dogs);
		}
		setPage(1);
	}, [age]);

	// if gender state changes, filters dogs by gender
	useEffect(() => {
		if (gender) {
			let filtered_dogs = allDogs?.filter((dog) => dog.gender === gender);
			if (query) {
				filtered_dogs = filtered_dogs?.filter(
					(dog) =>
						dog.name.toLowerCase().includes(query.toLowerCase()) ||
						(dog.microchipID &&
							dog.microchipID.toLowerCase().includes(query.toLowerCase()))
				);
			}
			if (selectedCat.length > 0) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.categories.some((category) => selectedCat.includes(category))
				);
			}
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		} else {
			let filtered_dogs = allDogs;
			if (selectedCat.length > 0) {
				filtered_dogs = filtered_dogs?.filter((dog) =>
					dog.categories.some((category) => selectedCat.includes(category))
				);
			}
			if (query) {
				filtered_dogs = filtered_dogs?.filter(
					(dog) =>
						dog.name.toLowerCase().includes(query.toLowerCase()) ||
						(dog.microchipID &&
							dog.microchipID.toLowerCase().includes(query.toLowerCase()))
				);
			}
			filtered_dogs = filtered_dogs?.filter(
				(dog) => dog.age >= age[0] && dog.age <= age[1]
			);
			setDogs(filtered_dogs);
		}
		setPage(1);
	}, [gender]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AdminNavBar header="Manage Dogs" setTheme={theme} />
			<main>
				<Container sx={{ pt: 8 }} maxWidth="xl">
					<Stack sx={{ mb: 4 }} spacing={4}>
						<Stack spacing={4} justifyContent="center" direction="row">
							<GoBackButton handleBack={handleBack} />
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
								sx={{ width: "20%" }}
							/>
							<FormControl sx={{ width: "20%" }}>
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
							{categories && (
								<FormControl sx={{ width: "20%" }}>
									<InputLabel id="categories-label">
										<div style={{ display: "flex", alignItems: "flex-end" }}>
											<FilterAltOutlinedIcon
												fontSize="small"
												style={{ marginRight: ".5em" }}
											/>
											<span>Filter Dogs by Category</span>
										</div>
									</InputLabel>
									<Select
										labelId="categories-label"
										id="categories"
										name="categories"
										multiple
										value={selectedCat}
										onChange={handleCategory}
										input={<OutlinedInput label="Tagsssssssssssssssssssss" />}
										renderValue={(selected) => selected.join(", ")}
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
							<Slider
								getAriaLabel={() => "Age range"}
								value={age}
								onChange={handleAge}
								min={0}
								max={30}
								valueLabelDisplay="on"
								marks={[{ value: 15, label: "Filter Dogs by Age (Years)" }]}
								disableSwap
								sx={{ width: "20%" }}
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
								<AdminPaginatedDogCards
									page={page}
									itemsPerPage={itemsPerPage}
									dogsData={dogs}
									categories={categories}
									viewDog={handleViewDog}
									handleDelete={handleDelete}
									handleStatus={handleStatus}
								/>
							) : null}
						</Grid>
						<Stack spacing={4} justifyContent="center" sx={{ mt: 4 }}>
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
			<SpeedDial
				ariaLabel="speeddial"
				sx={{ position: "fixed", bottom: "4%", right: "3%" }}
				icon={<SpeedDialIcon />}
			>
				{actions.map((action) => (
					<SpeedDialAction
						key={action.name}
						icon={action.icon}
						tooltipTitle={action.name}
						onClick={handleAddDog}
					/>
				))}
			</SpeedDial>
		</ThemeProvider>
	);
}
