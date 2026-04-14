const API_BASE_URL = '/api';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function uploadImage(file, title, description, entityType, entityId, sortOrder = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId.toString());
  if (sortOrder !== null) formData.append('sortOrder', sortOrder.toString());

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}/images/upload`, {
    method: 'POST',
    headers,
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

export function updateImageTitle(imageId, title) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}/images/${imageId}/title`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ title }),
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

export function getThumbnailUrl(imageId) {
  const token = getAuthToken();
  let url = `${API_BASE_URL}/images/${imageId}/thumbnail`;
  // Add token as query param for img src tags (can't use headers)
  if (token) {
    url += `?token=${encodeURIComponent(token)}`;
  }
  return url;
}

export function getOriginalImageUrl(imageId) {
  const token = getAuthToken();
  let url = `${API_BASE_URL}/images/${imageId}`;
  // Add token as query param for img src tags (can't use headers)
  if (token) {
    url += `?token=${encodeURIComponent(token)}`;
  }
  return url;
}

export function deleteImage(imageId) {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}/images/${imageId}`, {
    method: 'DELETE',
    headers,
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return null;
  });
}

