import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireAuth = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div style={{ textAlign: "center", marginTop: 50 }}>
            <h1>🚫 Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </div>;
    }

    return <Outlet />;
};

export default RequireAuth;
