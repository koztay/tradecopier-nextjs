const dotenv = require('dotenv');
const MetaApi = require('metaapi.cloud-sdk').default;
const axios = require('axios');

dotenv.config();

class MT5Client {
    constructor() {
        this.api = new MetaApi(process.env.META_API_TOKEN);
        this.connection = null;
    }

    async connect() {
        try {
            console.log('Checking for existing accounts...');
            
            // Get existing accounts using REST API
            const response = await axios.get('https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts', {
                headers: {
                    'auth-token': process.env.META_API_TOKEN
                }
            });
            
            const accounts = response.data;
            console.log(`Found ${accounts.length} accounts`);
            
            // Get the first deployed account with matching login
            let account = accounts.find(acc => 
                acc.login === process.env.MT5_LOGIN && 
                acc.state === 'DEPLOYED'
            );
            
            if (!account) {
                console.error('No deployed account found with login:', process.env.MT5_LOGIN);
                return false;
            }

            console.log('Using existing account, ID:', account._id);

            // Get the MetaApi account instance
            const metaApiAccount = await this.api.metatraderAccountApi.getAccount(account._id);

            console.log('Connecting to broker...');
            const connection = metaApiAccount.getStreamingConnection();
            await connection.connect();

            console.log('Waiting for synchronization...');
            await connection.waitSynchronized();

            this.connection = connection;

            // Subscribe to market data
            await this.connection.subscribeToMarketData('EURUSD');
            
            console.log('Successfully connected to MT5');
            return true;

        } catch (error) {
            console.error('Connection error:', error);
            return false;
        }
    }

    async getAccountInfo() {
        if (!this.connection) {
            throw new Error('Not connected');
        }

        // Wait for account information to be synchronized
        await this.connection.waitSynchronized();

        // Get account info directly from terminal state
        const accountInfo = this.connection.terminalState.accountInformation;
        if (!accountInfo) {
            throw new Error('Account information not available');
        }

        console.log('Account Info:', {
            balance: accountInfo.balance,
            equity: accountInfo.equity,
            margin: accountInfo.margin,
            freeMargin: accountInfo.freeMargin,
            leverage: accountInfo.leverage,
            currency: accountInfo.currency
        });
        return accountInfo;
    }

    async getSymbolPrice(symbol = 'EURUSD') {
        if (!this.connection) {
            throw new Error('Not connected');
        }

        // Wait for price data to be synchronized
        await this.connection.waitSynchronized();

        // Get price directly from terminal state
        const price = this.connection.terminalState.price(symbol);
        if (!price) {
            throw new Error(`Price not available for ${symbol}`);
        }

        console.log(`${symbol} Price:`, {
            bid: price.bid,
            ask: price.ask,
            profitTickValue: price.profitTickValue,
            lossTickValue: price.lossTickValue
        });
        return price;
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
            console.log('Disconnected from MT5');
        }
    }
}

// Usage
async function main() {
    const client = new MT5Client();
    
    try {
        if (await client.connect()) {
            console.log('Connected successfully');
            
            // Wait a bit for synchronization
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Get account info
            await client.getAccountInfo();
            
            // Wait a bit between operations
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get EURUSD price
            await client.getSymbolPrice('EURUSD');
            
            // Keep the process running
            console.log('Listening for price updates (Ctrl+C to exit)...');
        }
    } catch (error) {
        console.error('Error:', error);
        await client.disconnect();
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    const client = new MT5Client();
    await client.disconnect();
    process.exit(0);
});

main(); 