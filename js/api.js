// ============================================
// API Helper Functions
// ============================================

// Make API call
export async function apiCall(url, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON response
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Upload file as base64
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Get file extension
export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}
