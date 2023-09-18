import { useParams, Link, useHistory } from "react-router-dom";
import {
	useContext,
	useState,
	useEffect,
	forwardRef,
	SyntheticEvent,
} from "react";
import axios from "axios";

import "../css/styles.css";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import PublicNavBar from "../components/public-nav-bar";
import Stack from "@mui/material/Stack";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import DonateButton from "../components/donate-button";

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

interface DogType {
	[key: string]: any;
}

interface ParamsType {
	id: string;
}

export default function PublicViewDog() {
	// get dog ID from parameter in URL
	const { id } = useParams<ParamsType>();
	// store/set dog data based on dog ID to display on page
	const [dog, setDog] = useState<DogType>();
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);

	// initialize history for routing
	const history = useHistory();

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// async function to retrieve dog with dog ID from Dogs Service
	const retrieveDog = async () => {
		setLoading(true);

		try {
			const response = await axios.post(`http://${orchestratorURL}/getDog/`, {
				id: id,
			});
			const responseData = response.data;
			setDog(responseData);
		} catch (error) {
			console.error("Get Dog API error:", error);
		} finally {
			setLoading(false);
		}
	};

	// onClick event listener to redirect user back to previous page
	const handleBack = () => {
		history.goBack();
	};

	// on initial render, retrieve dog with dog ID
	useEffect(() => {
		retrieveDog();
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<PublicNavBar setTheme={theme} setTitle="SOSD View Dog" />
			<main>
				<Container sx={{ py: 8 }} maxWidth="xl">
					<Grid container spacing={2} justifyContent="center">
						{loading ? (
							<Grid item>
								<CircularProgress />
							</Grid>
						) : (
							<>
								<Stack spacing={4}>
									{dog && dog.image ? (
										<img src={dog.image} width="500" height="300" />
									) : null}
									{dog ? (
										<>
											<Typography variant="h2" gutterBottom>
												{dog.name}
											</Typography>
											<Typography variant="h5" gutterBottom>
												<strong>Date of Birth:</strong> {dog.DOB} ({dog.age}{" "}
												years old)
											</Typography>
											<Typography variant="h5" gutterBottom>
												<strong>Gender:</strong> {dog.gender}
											</Typography>
											<Typography variant="h5" gutterBottom>
												<strong>Personality:</strong> {dog.desc}
											</Typography>
											{!dog.is_sponsored && (
												<Typography variant="h5" gutterBottom>
													<strong>Want to be a sponsor for this dog?</strong>{" "}
													<DonateButton dogID={id} />
												</Typography>
											)}
										</>
									) : null}
								</Stack>
							</>
						)}
					</Grid>
					<Stack spacing={4} justifyContent="center" direction="row">
						<Button
							variant="outlined"
							sx={{
								mt: 4,
							}}
							endIcon={<ReplyOutlinedIcon fontSize="small" />}
							onClick={handleBack}
						>
							Go Back
						</Button>
					</Stack>
				</Container>
			</main>
		</ThemeProvider>
	);
}
