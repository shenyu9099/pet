// ============================================
// Authentication Logic
// ============================================

import { API_ENDPOINTS } from './config.js';
import { apiCall } from './api.js';

// Check if user is authenticated
export function checkAuth() {
    const user = localStorage.getItem('petmoments_user');
    return user !== null;
}

// Get current user
export function getCurrentUser() {
    const userStr = localStorage.getItem('petmoments_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Login user
export async function login(email, password) {
    try {
        const response = await apiCall(API_ENDPOINTS.USERS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response && response.success) {
            localStorage.setItem('petmoments_user', JSON.stringify(response.user));
            return { success: true, user: response.user };
        } else {
            return { success: false, error: response.error || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// Register user
export async function register(name, email, password) {
    try {
        const response = await apiCall(API_ENDPOINTS.USERS.REGISTER, {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        if (response && response.success) {
            return { success: true, userId: response.userId };
        } else {
            return { success: false, error: response.error || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// Logout user
export function logout() {
    localStorage.removeItem('petmoments_user');
}

// Require authentication (redirect if not logged in)
export function requireAuth() {
    if (!checkAuth()) {
        location.href = 'login.html';
        return false;
    }
    return true;
}
