import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Checks the user's role from sessionStorage.
 * @returns {string} The user's role, defaults to 'user'.
 */
const checkUserRole = (): string => {
    return sessionStorage.getItem('userRole') || 'user';
};

/**
 * A component that protects routes, allowing access only to users with an 'admin' role.
 * For admin routes, it allows the page to load first and lets the component handle authentication internally.
 * For other routes, it redirects immediately if not authorized.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 * @param {boolean} props.allowPageLoad - Whether to allow the page to load before checking authentication.
 */
// FIX: Made children prop optional to resolve TypeScript inference issue in App.tsx
const ProtectedRoute = ({ children, allowPageLoad = false }: { children?: React.ReactNode; allowPageLoad?: boolean }) => {
    const navigate = useNavigate();
    const userRole = checkUserRole();

    useEffect(() => {
        // For admin routes, don't redirect immediately - let the component handle authentication
        if (!allowPageLoad && userRole !== 'admin') {
            alert('Akses ditolak. Anda harus menjadi admin untuk mengakses halaman ini.');
            navigate('/');
        }
    }, [userRole, navigate, allowPageLoad]);

    // Always render children - let the component handle authentication internally if needed
    return <>{children}</>;
};

export default ProtectedRoute;