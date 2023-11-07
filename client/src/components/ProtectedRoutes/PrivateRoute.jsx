import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthValue } from './AuthContext';

export default function PrivateRoute({ children }) {
    const { currentUser } = useAuthValue();

    if (currentUser === undefined) {
    // If the currentUser is null, it means that the data hasn't loaded yet
    // So we navigate to the loading page while waiting for the data to load
    return <Navigate to="/loading" replace />;
    } else if (!currentUser?.emailVerified) {
    // Guard clause: If the currentUser's email is not verified
    return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
