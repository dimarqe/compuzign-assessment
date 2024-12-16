import axios from 'axios';

const baseURL = 'https://trialw8jva4.jfrog.io';
var token = '';
var currentUser = '';

class ResponseObj {
    constructor(status, data){
        this.status = status,
        this.data = data
    }
}

export const login = async(username, password)=>{
    try {
        const response = await axios.post(`${baseURL}/access/api/v1/tokens`, 
            {   
                scope: "applied-permissions/admin",
                expires_in: 86400
            },
            {
                auth: {
                    username: username,
                    password: password
                },
                headers: {
                    'Content-Type': 'application/json'
                },
            });
    
        token = response.data.access_token;
        currentUser = response.data.username;
        return true;
    } catch (error) {
        return false;
    }
}

export const systemPing = async ()=>{
    try {
        let response = await axios.get(`${baseURL}/artifactory/api/system/ping`);
        
        return new ResponseObj(response.status, response.data);
    } catch (error) { 
        return new ResponseObj(error.status, error.message);
    }
}

export const getSystemVersion = async ()=>{
    try {
        const response = await axios.get(`${baseURL}/artifactory/api/system/status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return new ResponseObj(response.status, response.data);
    } catch (error) {
        return new ResponseObj(error.status, error.message);
    }
}

export const getStorageInfo = async ()=>{
    try {
        const response = await axios.get(`${baseURL}/artifactory/api/storageinfo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return new ResponseObj(response.status, response.data);
    } catch (error) {
        return new ResponseObj(error.status, error.message);
    }
}

export const getRepositoriesBasic = async ()=>{
    try {
        const response = await axios.get(`${baseURL}/artifactory/api/repositories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return new ResponseObj(response.status, response.data);
    } catch (error) {
        return new ResponseObj(error.status, error.message);
    }
}

export const getRepositoriesConfig = async ()=>{
    try {
        const response = await axios.get(`${baseURL}/artifactory/api/repositories/configurations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return new ResponseObj(response.status, response.data);
    } catch (error) {
        return new ResponseObj(error.status, error.message);
    }
}

export const updateRepository = async (repoKey, field, data)=>{
    let updatedInfo = {};

    if(field == 'description'){
        updatedInfo = {
            'description': data
        }
    }
    else if(field == 'notes'){
        updatedInfo = {
            'notes': data
        }
    }
    else if(field == 'includes pattern'){
        updatedInfo = {
            'includesPattern': data
        }
    }
    else if(field == 'excludes pattern'){
        updatedInfo = {
            'excludesPattern': data
        }
    }

    try {
        const response = await axios.post(`${baseURL}/artifactory/api/repositories/${repoKey}`, 
            updatedInfo,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

        return new ResponseObj(response.status, response.data);
    } catch (error) {
        return new ResponseObj(error.status, error.message);
    }
}

export const createUser = async(username, email, password)=>{
    try {
        const response = await axios.post(`${baseURL}/access/api/v2/users`, 
            {
                username: username,
                email: email,
                password: password
                
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

        return new ResponseObj(response.status, response.data);
    } catch (error) {
        return new ResponseObj(error.status, error.response?.data || error.message);
    }
}

export const getUsers = async()=>{
    try {
        const response = await axios.get(`${baseURL}/access/api/v2/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        let userData = {
            loggedIn: currentUser,
            users: response.data.users
        }

        return new ResponseObj(response.status, userData);
    } catch (error) {
        return new ResponseObj(error.status, error.message);
    }
}

export const deleteUser = async(username)=>{
    try {
        const response = await axios.delete(`${baseURL}/access/api/v2/users/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return new ResponseObj(response.status, response.data);
    } catch (error) {
        return new ResponseObj(error.status, error.message);
    }
}