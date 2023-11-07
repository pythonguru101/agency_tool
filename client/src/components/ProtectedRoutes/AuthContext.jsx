import React, { useContext } from 'react';

const AuthContext = React.createContext();

export function AuthProvider({ children, value }) {
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthValue() {
    const authValue = useContext(AuthContext);

    if (authValue === undefined) {
        throw new Error('useAuthValue must be used within an AuthProvider');
    }

    return authValue;
}
