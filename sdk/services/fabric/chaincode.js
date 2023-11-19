const {  Gateway, Wallets } = require('fabric-network');
const path = require('path');

const fs = require("fs");

const WALLET_PATH = path.join(__dirname, 'wallet');;
const CHANNEL_NAME = "supplychainchannel";
const CHAINCODE_NAME = "supplychain";
const CCP_PATH = path.resolve(__dirname, 'connection-org1.json');
const org1UserId = "javascriptAppUser";

async function connectToNetwork() {
    let ccp = JSON.parse(fs.readFileSync(CCP_PATH, 'utf8'));
    let wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

    const identity = await wallet.get(org1UserId);

    if (!identity){
        console.log(`An identity for the user with ${org1UserId} does not exist in the wallet`);
        throw new Error(`An identity for the user with ${org1UserId} does not exist in the wallet`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {wallet, identity: org1UserId, discovery: { enabled: true, asLocalhost: true} });

    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    return {
        gateway, network, contract
    }
}


async function invokeChaincode(func, args, isQuery){
    try {

        //chainging object passed as an object to array 

        let networkObj = await connectToNetwork(org1UserId);
        console.log("inside the invoke chaincode");
        console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);

        if(isQuery === true){
            console.log("inside isQuery");

            if (args){
                console.log("args ", args);
                let response = await networkObj.contract.evaluateTransaction(func, args);

                console.log(response.toString());
                console.log(`transaction ${func} with args has been evaluated`);

                await networkObj.gateway.disconnect();

                return JSON.parse(response.toString());

            } else{
                let response = await networkObj.contract.evaluateTransaction(func);
                console.log(response);
                console.log(`transaction ${func} without args has been evaluated`);
                await networkObj.gateway.disconnect();

                return JSON.parse(response.toString());
            }
        } else {
            console.log('not Query');

            if(args){
                console.log("args ", args);
                console.log("func ", func);
                let response = await networkObj.contract.submitTransaction(func, ...args);
                console.log("after submit response ", response.toString());

                await networkObj.gateway.disconnect();

                return JSON.parse(response.toString());

            } else {
                let response = await networkObj.contract.submitTransaction(func);
                console.log(response);
                console.log(`Transaction ${func} with args has been submitted`);

                await networkObj.gateway.disconnect();

                return JSON.parse(response.toString());
            }

        }
        
    } catch (error) {
        console.log(`failed to submit transaction, error ${error}`);        
        throw error;
    }
}

module.exports = {invokeChaincode};