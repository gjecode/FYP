import { Box, Typography } from "@mui/material";

export default function Error() {
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
			<Typography variant="h1" style={{ color: "black" }}>
				404
			</Typography>
			<Typography variant="h6" style={{ color: "black" }}>
				The page you’re looking for doesn’t exist.
			</Typography>
		</Box>
	);
}
