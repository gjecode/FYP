import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import { Box, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

interface DogType {
	[key: string]: any;
}

interface ParamsType {
	id: string;
}

export default function DonationSuccess() {
	// get dog ID from parameter in URL
	const { id } = useParams<ParamsType>();
	// store/set dog data based on dog ID to display on page
	const [dog, setDog] = useState<DogType>();
	// track status of loading data from API
	const [loading, setLoading] = useState<boolean>(false);

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

	// on initial render, retrieve dog with dog ID
	useEffect(() => {
		retrieveDog();
	}, []);

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			{loading ? (
				<CircularProgress />
			) : (
				<>
					<Typography variant="h1" style={{ color: "black" }}>
						Thank you for donating to {dog && dog.name}!
					</Typography>
					<Typography variant="h6" style={{ color: "black" }}>
						We would like to inform you that your donation is being processed,
						and you will receive an email confirmation shortly :)
					</Typography>
					<Link to="/sosd">
						<Button variant="outlined" sx={{ mt: 3 }}>
							Go back to homepage
						</Button>
					</Link>
				</>
			)}
		</Box>
	);
}
