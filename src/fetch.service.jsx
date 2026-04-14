const API_BASE_URL = '/api';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorResponse = await response.json().catch(() => ({ message: response.statusText }));
      const error = new Error(errorResponse.message || `HTTP error! status: ${response.status}`);
      // Attach the full error response for components that need it (e.g., MessagePanel)
      error.errorResponse = errorResponse;
      error.status = response.status;
      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null;
    }

    // Handle JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export function get(endpoint, { params } = {}) {
  let url = endpoint;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }
  
  console.log('GET request to:', url);
  return request(url, {
    method: 'GET',
  });
}

export function post(endpoint, data) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function put(endpoint, data) {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function del(endpoint) {
  return request(endpoint, {
    method: 'DELETE',
  });
}
