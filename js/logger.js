// Application Insights Logger for PetMoments
// This module provides logging functionality to track API requests and user actions

const APP_INSIGHTS_CONFIG = {
    instrumentationKey: '2645c1d8-9be8-471b-821d-8473022d0afc',
    ingestionEndpoint: 'https://francecentral-1.in.applicationinsights.azure.com/v2/track',
    enabled: true // Set to false to disable logging
};

class AppInsightsLogger {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
    }

    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    setUserId(userId) {
        this.userId = userId;
    }

    // Log API request
    async logApiRequest(method, url, statusCode, duration, requestData = null, responseData = null, error = null) {
        if (!APP_INSIGHTS_CONFIG.enabled) return;

        const telemetry = {
            name: 'Microsoft.ApplicationInsights.Request',
            time: new Date().toISOString(),
            iKey: APP_INSIGHTS_CONFIG.instrumentationKey,
            tags: {
                'ai.session.id': this.sessionId,
                'ai.user.id': this.userId || 'anonymous',
                'ai.operation.name': `${method} ${this.extractEndpointName(url)}`,
                'ai.cloud.role': 'PetMoments-Frontend'
            },
            data: {
                baseType: 'RequestData',
                baseData: {
                    ver: 2,
                    name: `${method} ${this.extractEndpointName(url)}`,
                    duration: this.formatDuration(duration),
                    responseCode: statusCode.toString(),
                    success: statusCode >= 200 && statusCode < 400,
                    url: url,
                    properties: {
                        method: method,
                        endpoint: this.extractEndpointName(url),
                        userId: this.userId || 'anonymous',
                        requestData: requestData ? JSON.stringify(requestData).substring(0, 500) : null,
                        responseData: responseData ? JSON.stringify(responseData).substring(0, 500) : null,
                        error: error ? error.toString() : null
                    }
                }
            }
        };

        await this.sendTelemetry(telemetry);
    }

    // Log custom event (e.g., button clicks, page views)
    async logEvent(eventName, properties = {}) {
        if (!APP_INSIGHTS_CONFIG.enabled) return;

        const telemetry = {
            name: 'Microsoft.ApplicationInsights.Event',
            time: new Date().toISOString(),
            iKey: APP_INSIGHTS_CONFIG.instrumentationKey,
            tags: {
                'ai.session.id': this.sessionId,
                'ai.user.id': this.userId || 'anonymous',
                'ai.cloud.role': 'PetMoments-Frontend'
            },
            data: {
                baseType: 'EventData',
                baseData: {
                    ver: 2,
                    name: eventName,
                    properties: {
                        ...properties,
                        userId: this.userId || 'anonymous',
                        timestamp: new Date().toISOString()
                    }
                }
            }
        };

        await this.sendTelemetry(telemetry);
    }

    // Log page view
    async logPageView(pageName, url) {
        if (!APP_INSIGHTS_CONFIG.enabled) return;

        const telemetry = {
            name: 'Microsoft.ApplicationInsights.Pageview',
            time: new Date().toISOString(),
            iKey: APP_INSIGHTS_CONFIG.instrumentationKey,
            tags: {
                'ai.session.id': this.sessionId,
                'ai.user.id': this.userId || 'anonymous',
                'ai.cloud.role': 'PetMoments-Frontend'
            },
            data: {
                baseType: 'PageviewData',
                baseData: {
                    ver: 2,
                    name: pageName,
                    url: url,
                    properties: {
                        userId: this.userId || 'anonymous'
                    }
                }
            }
        };

        await this.sendTelemetry(telemetry);
    }

    // Log exception/error
    async logException(error, severityLevel = 3) {
        if (!APP_INSIGHTS_CONFIG.enabled) return;

        const telemetry = {
            name: 'Microsoft.ApplicationInsights.Exception',
            time: new Date().toISOString(),
            iKey: APP_INSIGHTS_CONFIG.instrumentationKey,
            tags: {
                'ai.session.id': this.sessionId,
                'ai.user.id': this.userId || 'anonymous',
                'ai.cloud.role': 'PetMoments-Frontend'
            },
            data: {
                baseType: 'ExceptionData',
                baseData: {
                    ver: 2,
                    exceptions: [{
                        typeName: error.name || 'Error',
                        message: error.message || error.toString(),
                        hasFullStack: !!error.stack,
                        stack: error.stack || '',
                        parsedStack: []
                    }],
                    severityLevel: severityLevel, // 1=Verbose, 2=Information, 3=Warning, 4=Error, 5=Critical
                    properties: {
                        userId: this.userId || 'anonymous',
                        url: window.location.href
                    }
                }
            }
        };

        await this.sendTelemetry(telemetry);
    }

    // Send telemetry to Application Insights
    async sendTelemetry(telemetry) {
        try {
            // Use sendBeacon for better reliability (doesn't block page unload)
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(telemetry)], { type: 'application/json' });
                navigator.sendBeacon(APP_INSIGHTS_CONFIG.ingestionEndpoint, blob);
            } else {
                // Fallback to fetch
                await fetch(APP_INSIGHTS_CONFIG.ingestionEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(telemetry),
                    keepalive: true
                });
            }

            // Also log to console in development
            console.log('[AppInsights]', telemetry.data.baseType, telemetry.data.baseData);
        } catch (error) {
            console.error('[AppInsights] Failed to send telemetry:', error);
        }
    }

    // Helper: Extract endpoint name from URL
    extractEndpointName(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            
            // Try to extract meaningful endpoint name
            if (url.includes('register-user')) return 'register-user';
            if (url.includes('login-user')) return 'login-user';
            if (url.includes('create-pet')) return 'create-pet';
            if (url.includes('get-my-pets')) return 'get-my-pets';
            if (url.includes('create-moment')) return 'create-moment';
            if (url.includes('get-moments')) return 'get-moments';
            if (url.includes('get-moment-by-id')) return 'get-moment-by-id';
            if (url.includes('update-moment')) return 'update-moment';
            if (url.includes('delete-moment')) return 'delete-moment';
            
            return pathname || 'unknown-endpoint';
        } catch {
            return 'unknown-endpoint';
        }
    }

    // Helper: Format duration for Application Insights (format: DD.HH:MM:SS.MMMMMM)
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const ms = milliseconds % 1000;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        return `00.${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms * 1000).padStart(6, '0')}`;
    }
}

// Create singleton instance
const logger = new AppInsightsLogger();

// Initialize user ID from localStorage if available
if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('userId');
    if (userId) {
        logger.setUserId(userId);
    }

    // Log page view on load
    window.addEventListener('load', () => {
        const pageName = document.title || window.location.pathname;
        logger.logPageView(pageName, window.location.href);
    });

    // Log unhandled errors
    window.addEventListener('error', (event) => {
        logger.logException(event.error || new Error(event.message), 4);
    });

    // Log unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        logger.logException(new Error(event.reason), 4);
    });
}

// Export logger instance
window.AppInsightsLogger = logger;

