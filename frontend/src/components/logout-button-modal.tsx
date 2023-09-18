import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Stack from "@mui/material/Stack";
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

export default function LogoutModal() {
	// enables modal
	const [open, setOpen] = useState(false);
	// function to logout
	let { logoutUser } = useContext(AuthContext);

	// functions for opening/closing modal
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	return (
		<div>
			<Button
				onClick={handleOpen}
				color="inherit"
				variant="outlined"
				endIcon={<LogoutOutlinedIcon fontSize="small" />}
			>
				Logout
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
							Are you sure you want to logout?
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
								onClick={logoutUser}
								variant="outlined"
								endIcon={<LogoutOutlinedIcon fontSize="small" />}
							>
								Confirm
							</Button>
						</Stack>
					</Box>
				</Fade>
			</Modal>
		</div>
	);
}
