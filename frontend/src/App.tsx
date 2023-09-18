import {
	BrowserRouter as Router,
	Route,
	Redirect,
	Switch,
} from "react-router-dom";

import Error404 from "./pages/404-page";
import LoginPage from "./pages/login-page";
import Home from "./pages/home-page";

import ManageDogs from "./pages/manage-dogs-page";
import ViewDog from "./pages/view-dog-page";
import AddDog from "./pages/add-dog-page";

import ManageCategories from "./pages/manage-dog-categories-page";
import AddDogCategory from "./pages/add-dog-category-page";
import ViewDogCategory from "./pages/view-dog-category-page";

import PublicDogCategories from "./pages/public-list-dog-categories-page";
import PublicDogsByCategory from "./pages/public-dogs-by-category";
import PublicDogs from "./pages/public-list-dogs-page";
import PublicViewDog from "./pages/public-view-dog-page";

import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./utils/admin-route";
import SubAdminRoute from "./utils/sub-admin-route";
import PrivateRoute from "./utils/private-route";

import ManageAccounts from "./pages/manage-accounts-page";
import AddAccount from "./pages/add-account-page";
import ViewAccount from "./pages/view-account-page";

import ManageRecords from "./pages/manage-records-page";
import AddRecord from "./pages/add-record-page";
import ViewRecord from "./pages/view-record-page";
import ManageFilteredRecords from "./pages/manage-filtered-records-page";

import ManagePayments from "./pages/manage-payments-page";
import ViewPayment from "./pages/view-payment-page";
import DonationSuccess from "./pages/donation-success-page";

export default function App() {
	return (
		<Router>
			<AuthProvider>
				<Switch>
					<Route exact path="/admin" component={LoginPage} />

					<PrivateRoute exact path="/admin/home" component={Home} />

					<AdminRoute exact path="/admin/accounts" component={ManageAccounts} />
					<AdminRoute
						exact
						path="/admin/accounts/:id"
						component={ViewAccount}
					/>
					<AdminRoute exact path="/admin/addAccount" component={AddAccount} />

					<SubAdminRoute exact path="/admin/dogs" component={ManageDogs} />
					<SubAdminRoute exact path="/admin/dogs/:id" component={ViewDog} />
					<SubAdminRoute exact path="/admin/addDog" component={AddDog} />

					<SubAdminRoute
						exact
						path="/admin/dogCategories"
						component={ManageCategories}
					/>
					<SubAdminRoute
						exact
						path="/admin/addDogCategory"
						component={AddDogCategory}
					/>
					<SubAdminRoute
						exact
						path="/admin/dogCategories/:id"
						component={ViewDogCategory}
					/>

					<SubAdminRoute exact path="/admin/records" component={ManageRecords} />
					<SubAdminRoute exact path="/admin/addRecord" component={AddRecord} />
					<SubAdminRoute exact path="/admin/records/:id" component={ViewRecord} />
					<SubAdminRoute exact path="/admin/filteredRecords/:id" component={ManageFilteredRecords} />

					<SubAdminRoute exact path="/admin/payments" component={ManagePayments} />
					<SubAdminRoute exact path="/admin/payments/:id" component={ViewPayment} />

					<Route exact path="/sosd" component={PublicDogCategories} />
					<Route exact path="/sosd/dogs" component={PublicDogs} />
					<Route exact path="/sosd/dogs/:id" component={PublicViewDog} />
					<Route
						exact
						path="/sosd/dogs/catFilter/:id"
						component={PublicDogsByCategory}
					/>

					<Route exact path="/sosd/success/:id" component={DonationSuccess} />

					<Route path="/error" component={Error404} />
					<Redirect to="/error" />
				</Switch>
			</AuthProvider>
		</Router>
	);
}
