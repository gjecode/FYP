import { Route, Redirect, RouteProps } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import jwt_decode from "jwt-decode";
import axios from "axios";

interface Props extends RouteProps {
	component: React.ComponentType<any>;
}

interface UserType {
	id: number;
	role: string;
}

const PrivateRoute: React.FC<Props> = ({ component: Component, ...rest }) => {
	const { user } = useContext(AuthContext);

	return (
		<Route
			{...rest}
			render={(props) =>
				user ? <Component {...props} /> : <Redirect to="/admin" />
			}
		/>
	);
};

export default PrivateRoute;
