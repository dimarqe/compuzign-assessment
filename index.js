import figlet from 'figlet';
import chalk from 'chalk';

import { systemPingPrompt, getSystemVersionPrompt, getStorageInfoPrompt, getRepositoriesPrompt, 
        createUserPrompt, deleteUserPrompt, updateRepositoryPrompt, loginPrompt } from './jfrogCLI/prompts.js';


const mainMenu = async()=>{
    console.log(chalk.blue(figlet.textSync('D.R-CLI')));

    const action = await select({
        message: 'Please select one of the following menu options',
        choices: [
            { name: 'System Ping', value: 'System Ping' },
            { name: 'System Version', value: 'System Version' },
            { name: 'Create User', value: 'Create User' },
            { name: 'Delete User', value: 'Delete User' },
            { name: 'Get Storage Info', value: 'Get Storage Info' },
            { name: 'Update Repository', value: 'Update Repository' },
            { name: 'List Repositories', value: 'List Repositories' },
            { name: 'EXIT', value: 'EXIT' }
        ],
        pageSize: 9,
        loop: false
    });

    return action;
}

const featureOptions = async(choice)=>{
    switch (choice) {
        case 'System Ping':
            await systemPingPrompt();
            break;
    
        case 'System Version':
            await getSystemVersionPrompt();
            break;

        case 'Get Storage Info':
            await getStorageInfoPrompt();
            break;

        case 'List Repositories':
            await getRepositoriesPrompt();
            break;

        case 'Create User':
            await createUserPrompt();
            break;

        case 'Delete User':
            await deleteUserPrompt();
            break;
        
        case 'Update Repository':
            await updateRepositoryPrompt();
            break;
        
        default:
            break;
    }
}

try {
    let authorized = await loginPrompt();

    if(authorized){
        do {
            var selection = await mainMenu();
            await featureOptions(selection);
            console.clear();
        } while (selection != 'EXIT');
            
        console.log('👋 until next time!');
    }
} catch (error) {
    console.clear();

    //error handling for if the user presses 'control + c' during runtime
    if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log('👋 until next time!');
        process.exit();
    } 
    else {
        console.log('🤕 Unexpected runtime error encountered...stopping application: ', error.message);
    }
}