import { Link } from "react-router-dom";
import * as React from "react";
import AuthContext from "../context/AuthContext";

import "../css/styles.css";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Theme } from "@mui/material/styles";
import LogoutModal from "./logout-button-modal";

type Anchor = "top" | "left" | "bottom" | "right";

export default function AdminNavBar({
	header,
	setTheme,
}: {
	header: string;
	setTheme: Theme;
}) {
	// stores decoded token
	const { user } = React.useContext(AuthContext);
	// set/store state of opening direction of navbar
	const [state, setState] = React.useState({
		top: false,
		left: false,
		bottom: false,
		right: false,
	});

	// enables navbar
	const toggleDrawer =
		(anchor: Anchor, open: boolean) =>
		(event: React.KeyboardEvent | React.MouseEvent) => {
			if (
				event.type === "keydown" &&
				((event as React.KeyboardEvent).key === "Tab" ||
					(event as React.KeyboardEvent).key === "Shift")
			) {
				return;
			}

			setState({ ...state, [anchor]: open });
		};

	// set list items of navbar
	const list = (anchor: Anchor) => (
		<Box
			sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
			role="presentation"
			onClick={toggleDrawer(anchor, false)}
			onKeyDown={toggleDrawer(anchor, false)}
		>
			<List>
				{user && user.role === "Admin" ? (
					<Link to="/admin/accounts">
						<ListItem disablePadding>
							<ListItemButton>
								<ListItemText primary="Manage Accounts" sx={{ color: "white" }} />
							</ListItemButton>
						</ListItem>
					</Link>
				) : null}
				{user && (user.role === "Admin" || user.role === "Sub-Admin") ? (
					<>
						<Link to="/admin/dogs">
							<ListItem disablePadding>
								<ListItemButton>
									<ListItemText primary="Manage Dogs" sx={{ color: "white" }} />
								</ListItemButton>
							</ListItem>
						</Link>
						<Link to="/admin/dogCategories" className="link">
							<ListItem disablePadding>
								<ListItemButton>
									<ListItemText
										primary="Manage Dog Categories"
										sx={{ color: "white" }}
									/>
								</ListItemButton>
							</ListItem>
						</Link>
						<Link to="/admin/records" className="link">
							<ListItem disablePadding>
								<ListItemButton>
									<ListItemText
										primary="Manage Records"
										sx={{ color: "white" }}
									/>
								</ListItemButton>
							</ListItem>
						</Link>
						<Link to="/admin/payments" className="link">
							<ListItem disablePadding>
								<ListItemButton>
									<ListItemText
										primary="Manage Payments"
										sx={{ color: "white" }}
									/>
								</ListItemButton>
							</ListItem>
						</Link>
					</>
				) : null}
			</List>
		</Box>
	);

	return (
		<>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar
					position="static"
					sx={{ backgroundColor: setTheme.palette.secondary.main }}
				>
					<Toolbar>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label="menu"
							sx={{ mr: 2 }}
							onClick={toggleDrawer("left", true)}
						>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							{header}
						</Typography>
						<LogoutModal />
					</Toolbar>
				</AppBar>
			</Box>
			<Drawer
				anchor={"left"}
				open={state["left"]}
				onClose={toggleDrawer("left", false)}
				sx={{
					"& .MuiDrawer-paper": {
						backgroundColor: setTheme.palette.secondary.main,
					},
				}}
			>
				{list("left")}
			</Drawer>
		</>
	);
}
