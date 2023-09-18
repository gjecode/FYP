import { Route, Redirect, RouteProps } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

interface Props extends RouteProps {
	component: React.ComponentType<any>;
}

const AdminRoute: React.FC<Props> = ({ component: Component, ...rest }) => {
	const { user } = useContext(AuthContext);

	return (
		<Route
			{...rest}
			render={(props) =>
				user && user.role === "Admin" ? (
					<Component {...props} />
				) : (
					<Redirect to="/admin/home" />
				)
			}
		/>
	);
};

export default AdminRoute;
