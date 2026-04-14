import { getRequest, postRequest, patchRequest } from './fetchService';

const MS_BASE_URL = 'http://localhost:8080';

const getUser = async (userId) => {
    const result = await getRequest(`${MS_BASE_URL}/user/${userId}`);
    return result;
};

const getAllUsers = async (filters) => {
    const result = await getRequest(`${MS_BASE_URL}/user/all`, filters);
    return result;
};

const createUser = async (userData) => {
    const result = await postRequest(`${MS_BASE_URL}/users`, userData);
    return result;
};

const updateUser = async (userId, data) => {
    const result = await patchRequest(`${MS_BASE_URL}/users/${userId}`, data);
    return result;
};

export const exampleService = {
    getUser,
    getAllUsers,
    createUser,
    updateUser
};
