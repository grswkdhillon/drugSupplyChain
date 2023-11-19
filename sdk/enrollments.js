/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// 'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildWallet } = require('../test-application/javascript/AppUtil.js');

const channelName = 'supplychainchannel';
const chaincodeName = 'supplychain';
const mspOrg1 = 'Org1MSP';
// const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';
// const org2UserId = 'appUser2';

var contract;

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
	try {
		const ccp = buildCCPOrg1();
		// const ccp2 = buildCCPOrg2();

		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		// const caClient2 = buildCAClient(FabricCAServices, ccp2, 'ca.org2.example.com');

		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, mspOrg1);
		// await enrollAdmin(caClient2, wallet, mspOrg2);

		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		// await registerAndEnrollUser(caClient2, wallet, mspOrg2, org2UserId, 'org2.department1');

		const gateway = new Gateway();
		try {

			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			contract = network.getContract(chaincodeName);

		} catch (error) {
			console.error(`******** FAILED to run the application: ${error}`);
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
	
	
}

main();

setTimeout(()=>{
    // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",contract);
	module.exports = contract;

   
}, 4000);



// ===================================================================================================================
// ==================  	other function invokes and queries    ===================================================== 


		// newManufacturer.key =  bcrypt.hashSync(JSON.stringify(newManufacturer),10); 
        // var result = await contract.submitTransaction('regManufacturer', newManufacturer.organizationName , newManufacturer.streetNo, newManufacturer.city, newManufacturer.state, newManufacturer.pincode, newManufacturer.phone, newManufacturer.businessRegisterationNo, newManufacturer.gstin, newManufacturer.email, newManufacturer.password, newManufacturer.profileStatus, newManufacturer.key, newManufacturer.role);
    
        // console.log("result: ", result.toString());


		// newDistributor.key =  bcrypt.hashSync(JSON.stringify(newDistributor),10); 
        // var result = await contract.submitTransaction('regManufacturer', newDistributor.organizationName , newDistributor.streetNo, newDistributor.city, newDistributor.state, newDistributor.pincode, newDistributor.phone, newDistributor.adhaar, newDistributor.gstin, newDistributor.email, newDistributor.password, newDistributor.profileStatus, newDistributor.key, newDistributor.role);
    
        // console.log("result: ", result.toString());





		// setTimeout(()=>{
		// 	contract = require("./enrollments.js");
		// 	console.log("contract value fetched");
		//   },5000);

		// app.get('/test', async (req,res) => {
  
		// 	var result = await contract.submitTransaction(req.body.functionName, req.body.key, req.body.key2);
		// 	// console.log("result: ", result.toString());
		// 	res.send(result.toString());
		//   })