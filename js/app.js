// ============================================
// Main Application Logic
// ============================================

import { API_ENDPOINTS } from './config.js';
import { checkAuth, logout } from './auth.js';
import { apiCall } from './api.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadMoments();
});

// Initialize application
function initializeApp() {
    const loginBtn = document.getElementById('loginBtn');
    const welcomeText = document.getElementById('welcomeText');
    
    if (checkAuth()) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (welcomeText && user) {
            welcomeText.textContent = `Welcome, ${user.username || 'User'}! 👋`;
        }
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = () => {
            logout();
            location.reload();
        };
    } else {
        if (welcomeText) {
            welcomeText.style.display = 'none';
        }
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => {
            location.href = 'login.html';
        };
    }
}

// Load all moments
async function loadMoments() {
    const container = document.getElementById('momentsContainer');
    
    try {
        const response = await apiCall(API_ENDPOINTS.MOMENTS.GET_ALL, {
            method: 'GET'
        });

        if (response && response.moments && response.moments.length > 0) {
            container.innerHTML = '';
            // Sort moments by timestamp (newest first)
            const sortedMoments = response.moments.sort((a, b) => {
                const timeA = a._ts || a.createdAt || 0;
                const timeB = b._ts || b.createdAt || 0;
                return timeB - timeA;
            });
            sortedMoments.forEach(moment => {
                container.appendChild(createMomentCard(moment));
            });
        } else {
            container.innerHTML = '<div class="loading">No moments yet. Be the first to share!</div>';
        }
    } catch (error) {
        console.error('Error loading moments:', error);
        container.innerHTML = '<div class="error-message">Failed to load moments. Please try again later.</div>';
    }
}

// Create moment card element
function createMomentCard(moment) {
    const card = document.createElement('div');
    card.className = 'moment-card';
    card.onclick = () => viewMomentDetail(moment.id, moment.userId);

    const coverImage = moment.coverImage || 'https://via.placeholder.com/300x250?text=No+Image';
    
    card.innerHTML = `
        <img src="${coverImage}" alt="${moment.title}" class="moment-image" onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
        <div class="moment-content">
            <h3 class="moment-title">${escapeHtml(moment.title)}</h3>
            <p class="moment-description">${escapeHtml(moment.description || 'No description')}</p>
            <div class="moment-meta">
                <span class="pet-name">🐾 ${escapeHtml(moment.petName || 'Unknown Pet')}</span>
                <span>${formatDate(moment.createdAt)}</span>
            </div>
        </div>
    `;

    return card;
}

// View moment detail
function viewMomentDetail(momentId, userId) {
    location.href = `moment-detail.html?id=${momentId}&userId=${userId}`;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
