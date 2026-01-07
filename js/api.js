// ============================================
// API Helper Functions
// ============================================

// Make API call with Application Insights logging
export async function apiCall(url, options = {}) {
    const startTime = Date.now();
    const method = options.method || 'GET';
    let requestData = null;
    let responseData = null;
    let statusCode = 0;
    let error = null;

    try {
        // Extract request data for logging (if present)
        if (options.body) {
            try {
                requestData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                // Remove sensitive data from logs
                if (requestData.password) requestData.password = '***';
                if (requestData.avatarData) requestData.avatarData = '[BASE64_DATA]';
                if (requestData.coverImageData) requestData.coverImageData = '[BASE64_DATA]';
                if (requestData.newMedia) {
                    requestData.newMedia = {
                        photos: requestData.newMedia.photos?.length || 0,
                        videos: requestData.newMedia.videos?.length || 0
                    };
                }
            } catch (e) {
                requestData = { note: 'Could not parse request data' };
            }
        }

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

        statusCode = response.status;

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON response
        const data = await response.json();
        responseData = data;

        // Log successful API request
        const duration = Date.now() - startTime;
        if (window.AppInsightsLogger) {
            window.AppInsightsLogger.logApiRequest(
                method,
                url,
                statusCode,
                duration,
                requestData,
                responseData
            );
        }

        return data;

    } catch (err) {
        error = err;
        const duration = Date.now() - startTime;
        
        // Log failed API request
        if (window.AppInsightsLogger) {
            window.AppInsightsLogger.logApiRequest(
                method,
                url,
                statusCode || 0,
                duration,
                requestData,
                null,
                error.message
            );
        }

        console.error('API call error:', err);
        throw err;
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
