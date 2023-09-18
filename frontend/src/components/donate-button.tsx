import axios from "axios";
import { useState } from "react";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

export default function DonateButton({ dogID }: { dogID: string }) {
	// tracks status of donating
	const [donating, setDonating] = useState<boolean>(false);

	// retrieve URL of Orchestrator Service from env 
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// async function to handle donation with stripe
	const handleDonate = async () => {
		setDonating(true);

		try {
			const response = await axios.post(
				`http://${orchestratorURL}/donate/`,
				{
					dogID: dogID,
				}
			);
			const { url } = response.data;
			window.location.href = url;
		} catch (error) {
			console.error("Stripe Checkout API error:", error);
		} finally {
			setTimeout(function () {
				setDonating(false);
			}, 3000);
		}
	};

	return (
		<>
			<Button
				variant="outlined"
				onClick={handleDonate}
				endIcon={<PaymentOutlinedIcon fontSize="small" />}
				sx={{ ml: 2 }} 
			>
				{donating ? "Donating... " : ""}
				{donating && <CircularProgress size={16} />}
				{!donating && "Donate"}
			</Button>
		</>
	);
}
