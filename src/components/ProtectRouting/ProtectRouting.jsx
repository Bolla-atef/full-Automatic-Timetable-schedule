import React from "react";
import { Navigate } from "react-router-dom";

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        return Date.now() > expiry;
    } catch {
        return true;
    }
}

export default function ProtectedRouting(props) {
    const token = localStorage.getItem('userToken');
    
    if (!token || isTokenExpired(token)) {
        localStorage.removeItem('userToken');
        return <Navigate to='/login'/>;
    }
    
    return props.children;
}