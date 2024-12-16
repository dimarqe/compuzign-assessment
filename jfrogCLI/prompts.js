import { confirm, input, password, select, Separator } from '@inquirer/prompts';

import { systemPing, getSystemVersion, getStorageInfo, getRepositoriesBasic, getRepositoriesConfig, updateRepository,
        createUser, deleteUser, getUsers, login } from './API.js';
import { json } from 'express';

//pauses the code execution until the user is ready to continue
const continueMessage = async() =>{
    await input({ theme: {prefix: ''} , message: '\n\n...Press "Enter" to continue'});
}

export const loginPrompt = async()=>{
    let authorized = true;

    //loop until correct password entered
    do {
        const username = await input({message: 'USERNAME: ', required: true});
        const passcode = await password({message: 'PASSWORD: ', mask: true});

        authorized = await login(username, passcode);
        
        console.clear();
        if(!authorized){
            console.error('Invalid login credentials... try again (CTRL + c to EXIT)');
        }
    } while (!authorized);
    
    console.clear();
    return true;
}

export const systemPingPrompt = async ()=>{
    let response = await systemPing();

    if(response.status.toString().startsWith('2') ) {
        console.log('System ping successful: ', response.data);
    }
    else {
        console.error('System ping failed: ', response,data);
    }

    await continueMessage();
}

export const getSystemVersionPrompt = async ()=>{
    let response = await getSystemVersion();

    if(response.status.toString().startsWith('2')) {
        console.log('System version info: ', response.data);
    } 
    else {
        console.error('Error fetching system version info: ', response,data);
    }

    await continueMessage();
}

export const getStorageInfoPrompt = async ()=>{
    let response = await getStorageInfo();

    if(response.status.toString().startsWith('2')) {
        console.log('Storage info: ', response.data);
    }
    else {
        console.error('Error fetching storage info: ', response.data);
    }

    await continueMessage();
}

export const getRepositoriesPrompt = async ()=>{
    let listType = await select({
        message: 'Select list view to display',
        choices: [{name: 'minimal', value: 'minimal'}, {name: 'full configuration', value: 'fullConfig'}],
        loop: false
    }); 

    let response = '';

    if(listType == 'fullConfig'){
        response = await getRepositoriesConfig();
    }
    else{
        response = await getRepositoriesBasic();
    }

    if(response.status.toString().startsWith('2')) {
        console.log('Repository list: ', response.data);
    }
    else {
        console.error('Error fetching repository list: ', response.data);
    }

    await continueMessage();
}

export const createUserPrompt = async()=>{
    let user = {
        username: '',
        email: '',
        password: ''
    };

    user.username = await input({message: 'Enter username: ', required: true, });
    user.email = await input({message: 'Enter email address: ', required: true, });

    let matching = false;

    do {
        let passcode = await password({message: '(Must contain at least: 1 lower case letter, 1 upper case letter, 1 digit, 8 characters)\nEnter password: ', mask: true});
        let passcode2 = await password({message: 'Re-enter password: ', mask: true});

        if(passcode == passcode2){
            user.password = passcode;
            matching = true;
        }
        else{
            console.error(`\nPasswords must match.\n`);
        }
    } while (!matching);

    let response = await createUser(user.username, user.email, user.password);

    if(response.status.toString().startsWith('2')) {
        console.log('User created successfully: ', response.data);
    }
    else {
        console.error('Error creating user: ', response.data);
    }

    await continueMessage();
}

export const deleteUserPrompt = async()=>{
    let getUsersResponse = await getUsers();

    //breaks code execution if request to get list of active users fails
    if(!getUsersResponse.status.toString().startsWith('2')) {
        console.error('Error retrieving user list: ', getUsersResponse.data);
        await continueMessage();
        return;
    }
    
    let userSelectionArr = [];
    let currentUser = getUsersResponse.data.loggedIn;

    getUsersResponse.data.users.forEach(user => {
        if(user.username != currentUser){
            let userObj = {name: user.username, value: user.username}
            userSelectionArr.push(userObj);
        }
    });

    userSelectionArr.push({name: '...CANCEL', value: "CANCEL"});

    const selectedUser = await select({
        message: 'Select the user to be deleted',
        choices: userSelectionArr,
        loop: false
    });

    //breaks code execution if user selects to CANCEL operation
    if(selectedUser == 'CANCEL'){
        console.log('Operation canceled');
        await continueMessage();
        return;
    }
    
    let deleteUserResponse = await deleteUser(selectedUser);

    if(deleteUserResponse.status.toString().startsWith('2')) {
        console.log('User successfully deleted: ', deleteUserResponse.data);
        await continueMessage();
        return;
    }
    else{
        console.error('Error deleting user: ', deleteUserResponse.data);
    }

    await continueMessage();
}

export const updateRepositoryPrompt = async()=>{
    let getRepoResponse = await getRepositoriesBasic();

    if(!getRepoResponse.status.toString().startsWith('2')) {
        console.error('Error retrieving repository list: ', getRepoResponse.data);
        await continueMessage();
        return;
    }
    
    let repoSelectionArr = [];

    getRepoResponse.data.forEach(repo => {
        let repoObj = {name: repo.key, value: repo.key, description: JSON.stringify(repo)};
        repoSelectionArr.push(repoObj);
    });

    repoSelectionArr.push({name: '...CANCEL', value: "CANCEL"});

    const selectedRepo = await select({
        message: 'Select the repository to update',
        choices: repoSelectionArr,
        loop: false
    });

    //breaks code execution if user selects to CANCEL operation
    if(selectedRepo == 'CANCEL'){
        console.log('Operation canceled');
        await continueMessage();
        return;
    }

    const updateField = await select({
        message: 'Select the field to update',
        choices: [
            {name: 'description', value: 'description'}, 
            {name: 'notes', value: 'notes'},
            {name: 'includes pattern', value: 'includes pattern'},
            {name: 'excludes pattern', value: 'excludes pattern'}
        ],
        loop: false
    });

    let newInfo = '';

    if(updateField == 'description'){
        newInfo = await input({ message: 'Enter repository description: ' });
    }
    else if(updateField == 'notes'){
        newInfo = await input({ message: 'Enter repository notes: ' });
    }
    else if(updateField == 'includes pattern'){
        newInfo = await input({ message: 'Enter repository "includes pattern": ' });
    }
    else if(updateField == 'excludes pattern'){
        newInfo = await input({ message: 'Enter repository "excludes pattern": ' });
    }
    
    let updateRepoResponse = await updateRepository(selectedRepo, updateField, newInfo);

    if(updateRepoResponse.status.toString().startsWith('2')) {
        console.log('Repository successfully updated: ', updateRepoResponse.data);
        await continueMessage();
        return;
    }
    else{
        console.error('Error updating repository: ', updateRepoResponse.data);
    }

    await continueMessage();
}