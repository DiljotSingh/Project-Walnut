import plaid from 'plaid';
import dotenv from 'dotenv';
import * as databaseFunctions from './database-handler.js';

dotenv.config();


let plaidClient = new plaid.Client({
    clientID: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    env: plaid.environments.sandbox,
    options: {
        version: '2019-05-29', // specify API version
    }
});

export async function createLinkToken(req, res) {
    // 1. Grab the client_user_id by searching for the current user in your database
    const user = await req.user.id;
    const clientUserId = await user;
    const configs = {
        user: {
            client_user_id: clientUserId,
        },
        client_name: 'Walnut',
        products: ['transactions'],
        country_codes: ['US'],
        language: 'en'
    }

    // 2. Create a link_token for the given user
    plaidClient.createLinkToken(configs, (err, response) => {
        const link_token = response.link_token;
        console.log(link_token);
        res.json({ link_token });
    });
};

export async function getAccessToken(req, res) {
    const public_token = req.body.public_token;

    plaidClient.exchangePublicToken(public_token, async (error, response) => {
        if (error != null) {
            console.log('Could not exchange public_token!' + '\n' + error);
            return res.send({ error: msg });
        }

        // Store the access_token and item_id in your database
        const access_token = response.access_token;
        const item_id = response.item_id;
        const user_id = req.user.id;
        await databaseFunctions.updateUserLinkTokens(user_id, access_token, item_id);

        console.log('Access Token: ' + access_token);
        console.log('Item ID: ' + item_id);
        //const { accounts, item } = await plaidClient.getAccounts(access_token);
    });
};
