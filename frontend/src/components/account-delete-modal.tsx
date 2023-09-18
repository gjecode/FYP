import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const style = {
	position: "absolute" as "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: 4,
};

export default function AccountDeleteModal({
	accountID,
	onDelete,
	onStatus,
}: {
	accountID: number;
	onDelete: (accountID: number) => void;
	onStatus: (status: string) => void;
}) {
	// stores token
	const { authTokens } = useContext(AuthContext);
	// enables modal
	const [open, setOpen] = useState(false);
	// tracks status of deleting
	const [deleting, setDeleting] = useState(false);

	// functions for opening/closing modal
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	// retrieve URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// async function to delete account with account ID from Account Service
	const deleteAccount = async (accountID: number) => {
		setDeleting(true);
		onStatus("");

		try {
			const accessToken = JSON.parse(authTokens!).access;

			const response = await axios.post(
				`http://${orchestratorURL}/deleteAccount/`,
				{
					id: accountID,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			handleClose();
			if (response.status === 204) {
				onDelete(accountID);
				onStatus("Successfully deleted account!");
			} else {
				onStatus("Failed to delete account!");
			}
		} catch (error) {
			console.error("Delete Account API error:", error);
			handleClose();
			onStatus("Failed to delete account!");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div>
			<Button
				onClick={handleOpen}
				color="error"
				variant="outlined"
				sx={{ width: "100%" }}
				endIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
			>
				Delete
			</Button>
			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
				open={open}
				onClose={handleClose}
				closeAfterTransition
				slots={{ backdrop: Backdrop }}
				slotProps={{
					backdrop: {
						timeout: 500,
					},
				}}
			>
				<Fade in={open}>
					<Box sx={style}>
						<Typography id="transition-modal-title" variant="h6" component="h2">
							Notice
						</Typography>
						<Typography id="transition-modal-description" sx={{ mt: 2 }}>
							Are you sure you want to delete this account?
						</Typography>
						<br></br>
						<Stack justifyContent="space-around" direction="row">
							<Button
								onClick={() => setOpen(false)}
								variant="outlined"
								color="secondary"
								endIcon={<CancelOutlinedIcon fontSize="small" />}
							>
								Cancel
							</Button>
							<Button
								onClick={() => deleteAccount(accountID)}
								variant="outlined"
								color="error"
								endIcon={<DeleteForeverOutlinedIcon fontSize="small"/>}
							>
								<div>
									{deleting ? "Deleting... " : ""}
									{deleting && <CircularProgress size={16} />}
									{!deleting && "Confirm"}
								</div>
							</Button>
						</Stack>
					</Box>
				</Fade>
			</Modal>
		</div>
	);
}
