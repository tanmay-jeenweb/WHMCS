import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DeviceRegistration from "./pages/DeviceRegistration";
import PendingApproval from "./pages/PendingApproval";

import UserHome from "./pages/user/UserHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserGroupMaster from "./pages/admin/user/UserGroupMaster";
import CreateUser from "./pages/admin/user/CreateUser";
import CreateUserType from "./pages/admin/user/CreateUserType";
import SystemSettingsMasterPage from "./pages/admin/masters/SystemSettingsMasterPage";
import OrderingMasterPage from "./pages/admin/masters/OrderingMasterPage";
import DomainMasterPage from "./pages/admin/masters/DomainMasterPage";
import EmailMasterPage from "./pages/admin/masters/EmailMasterPage";
import SupportMasterPage from "./pages/admin/masters/SupportMasterPage";
import InvoiceMasterPage from "./pages/admin/masters/InvoiceMasterPage";
import SecurityMasterPage from "./pages/admin/masters/SecurityMasterPage";
import CustomerMasterPage from "./pages/admin/masters/CustomerMasterPage";
import ResellerMasterPage from "./pages/admin/masters/ResellerMasterPage";
import MasterCreatorPage from "./pages/admin/masters/MasterCreatorPage";
import ProductServiceMasterPage from "./pages/admin/masters/ProductServiceMasterPage";
import ProductMasterPage from "./pages/admin/masters/ProductMasterPage";
import ActivityReport from "./pages/admin/ActivityReport";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/device-registration"
                element={<DeviceRegistration />}
            />

            <Route
                path="/pending-approval"
                element={<PendingApproval />}
            />

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/user/home"
                    element={<UserHome />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMasters={["user_master", "device_approval"]} requiredAction="read" />}>
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="activity_report" requiredAction="read" />}>
                <Route
                    path="/admin/report"
                    element={<ActivityReport />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="user_master" requiredAction="write" />}>
                <Route
                    path="/admin/users/create"
                    element={<CreateUser />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="user_type" requiredAction="read" />}>
                <Route
                    path="/admin/user-types"
                    element={<UserGroupMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="user_type" requiredAction="write" />}>
                <Route
                    path="/admin/user-types/create"
                    element={<CreateUserType />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route path="/admin/masters/system-settings" element={<SystemSettingsMasterPage />} />
                <Route path="/admin/masters/ordering-master" element={<OrderingMasterPage />} />
                <Route path="/admin/masters/domain-master" element={<DomainMasterPage />} />
                <Route path="/admin/masters/email-master" element={<EmailMasterPage />} />
                <Route path="/admin/masters/support-master" element={<SupportMasterPage />} />
                <Route path="/admin/masters/invoice-master" element={<InvoiceMasterPage />} />
                <Route path="/admin/masters/security-master" element={<SecurityMasterPage />} />
                <Route path="/admin/masters/customer-master" element={<CustomerMasterPage />} />
                <Route path="/admin/masters/reseller-master" element={<ResellerMasterPage />} />
                <Route path="/admin/masters/master-creator" element={<MasterCreatorPage />} />
                <Route path="/admin/masters/product-services" element={<ProductServiceMasterPage />} />
                <Route path="/admin/masters/product-master" element={<ProductMasterPage />} />
            </Route>
        </Routes>
    );
}