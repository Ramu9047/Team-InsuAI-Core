import { useAuth } from '../context/AuthContext';

/**
 * Role-Based Access Control Component
 * Conditionally renders children based on user role
 */
export function RoleGuard({ children, allowedRoles }) {
    const { user } = useAuth();

    // If no user is logged in, don't render
    if (!user) {
        return null;
    }

    // If user's role is not in allowed roles, don't render
    if (!allowedRoles.includes(user.role)) {
        return null;
    }

    // User has permission, render children
    return children;
}

/**
 * Usage Examples:
 * 
 * // Only show to admins
 * <RoleGuard allowedRoles={['ADMIN']}>
 *     <button onClick={deleteUser}>Delete User</button>
 * </RoleGuard>
 * 
 * // Show to agents and admins
 * <RoleGuard allowedRoles={['AGENT', 'ADMIN']}>
 *     <Link to="/agent-dashboard">Agent Dashboard</Link>
 * </RoleGuard>
 * 
 * // Show to all authenticated users
 * <RoleGuard allowedRoles={['USER', 'AGENT', 'ADMIN']}>
 *     <Link to="/profile">My Profile</Link>
 * </RoleGuard>
 */

export default RoleGuard;
