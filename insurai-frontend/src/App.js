import { BrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import AnimatedRoutes from "./components/AnimatedRoutes";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from './components/ToastSystem';

// Main App Component
export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <NotificationProvider>
                    <BrowserRouter>
                        <Layout>
                            <AnimatedRoutes />
                        </Layout>
                    </BrowserRouter>
                </NotificationProvider>
            </AuthProvider>
        </ToastProvider>
    );
}
