const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getCurrentToken() {
        return localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getCurrentToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add authorization token if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async putWithFormData(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getCurrentToken();

        const config = {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
            },
            body: formData,
        };

        // Add authorization token if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    removeToken() {
        localStorage.removeItem('authToken');
    }
}

export default new ApiClient();
