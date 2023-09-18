import { ReactNode } from "react";
import { createContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import jwt_decode from "jwt-decode";
import axios from "axios";

interface UserType {
	user_id: number;
	exp: number;
	iat: number;
	role: string;
	token_type: string;
	jti: string;
	username: string;
}

interface AuthContextType {
	loginUser: (
		e: React.FormEvent<HTMLFormElement>,
		onStatus: (status: string) => void
	) => Promise<void>;
	logoutUser: () => void;
	user: UserType | null;
	authTokens: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export default AuthContext;

interface Props {
	children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
	// sets/stores generated token in local storage
	const [authTokens, setAuthTokens] = useState<string | null>(
		localStorage.getItem("authTokens")
			? JSON.parse(localStorage.getItem("authTokens")!)
			: null
	);
	// sets/stores decoded token
	const [user, setUser] = useState<UserType | null>(
		localStorage.getItem("authTokens")
			? jwt_decode(localStorage.getItem("authTokens")!)
			: null
	);
	// tracks status of loading data from API
	const [loading, setLoading] = useState<boolean>(true);

	// initialize history for routing
	const history = useHistory();

	// retrieves URL of Orchestrator Service from env
	const orchestratorURL = import.meta.env.VITE_ORCHESTRATOR_URL;

	// async function to login user from Account Service
	const loginUser = async (
		e: React.FormEvent<HTMLFormElement>,
		onStatus: (status: string) => void
	) => {
		e.preventDefault();
		onStatus("");

		try {
			const formData = new FormData(e.currentTarget);

			const token_response = await axios.post(`http://${orchestratorURL}/login/`, {
				username: formData.get("username"),
				password: formData.get("password"),
			});
			const tokenResponseData = token_response.data;

			const otp_response = await axios.post(`http://${orchestratorURL}/otp/`, 
			{
				otp: formData.get("otp"),
			},
			{
				headers: {
					Authorization: `Bearer ${tokenResponseData.access}`,
				},
			}
			);
			const otpResponseData = otp_response.data;

			if ("success" in otpResponseData) {
				setAuthTokens(JSON.stringify(tokenResponseData));
				setUser(jwt_decode(tokenResponseData.access));
				localStorage.setItem("authTokens", JSON.stringify(tokenResponseData));
				history.push("/admin/home");
			}
			else {
				onStatus("Invalid OTP!");
			}

			// setAuthTokens(JSON.stringify(tokenResponseData));
			// setUser(jwt_decode(tokenResponseData.access));
			// localStorage.setItem("authTokens", JSON.stringify(tokenResponseData));
			// history.push("/admin/home");
		} catch (error) {
			onStatus("Invalid credentials!");
		}
	};

	// function to logout user
	const logoutUser = () => {
		setAuthTokens(null);
		setUser(null);
		localStorage.removeItem("authTokens");
		history.push("/admin");
	};

	// async function to refresh token
	const updateToken = async () => {
		try {
			if (authTokens !== null) {
				let authToken;
				typeof authTokens === "string"
					? (authToken = JSON.parse(authTokens))
					: (authToken = authTokens);

				const response = await axios.post(
					`http://${orchestratorURL}/refreshToken/`,
					{
						refresh: authToken.refresh,
					}
				);

				const responseData = response.data;
				setAuthTokens(JSON.stringify(responseData));
				setUser(jwt_decode(responseData.access));
				localStorage.setItem("authTokens", JSON.stringify(responseData));
			}
		} catch (error) {
			logoutUser();
		}

		loading ? setLoading(false) : null;
	};

	// sets payload of data to be passed to children components
	let contextData = {
		user: user,
		authTokens: authTokens,
		loginUser: loginUser,
		logoutUser: logoutUser,
	};

	// if authTokens/loading state changes, sets timer to refresh token every 9 minutes
	useEffect(() => {
		loading ? updateToken() : null;

		const interval = setInterval(() => {
			authTokens ? updateToken() : null;
		}, 1000 * 60 * 9);

		return () => clearInterval(interval);
	}, [authTokens, loading]);

	return (
		<AuthContext.Provider value={contextData}>
			{loading ? null : children}
		</AuthContext.Provider>
	);
};
