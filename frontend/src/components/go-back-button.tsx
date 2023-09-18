import ReplyIcon from "@mui/icons-material/Reply";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

export default function GoBackButton({
	handleBack,
}: {
	handleBack: () => void;
}) {
	return (
		<Tooltip title="Go back to previous page" placement="bottom">
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
				onClick={handleBack}
			>
				<ReplyIcon fontSize="large" color="primary" />
			</Box>
		</Tooltip>
	);
}
