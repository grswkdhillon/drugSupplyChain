# set -x  
# docker rmi $(docker images | awk '{if ($1 ~ "^dev") print $1":"$2}')

export FABRIC_CFG_PATH=$PWD/../config/
export PATH=${PWD}/../bin:$PATH
export VERBOSE=true
export CORE_PEER_TLS_ENABLED=true 
export CHANNEL_NAME=supplychainchannel
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem

export CC_NAME=supplychain
export CC_SRC_PATH=${PWD}/../chaincode/chaincode
export CC_RUNTIME_LANGUAGE=node
export CC_VERSION=1.0
export SEQUENCE=${1}

peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label ${CC_NAME}_${CC_VERSION} # >&log.txt
PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid ${CC_NAME}.tar.gz)

. ./switchPeer.sh 10

peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID}$ # >&log.txt
peer lifecycle chaincode install ${CC_NAME}.tar.gz # >&log.txt

. ./switchPeer.sh 11

peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID}$ # >&log.txt
peer lifecycle chaincode install ${CC_NAME}.tar.gz # >&log.txt


# ------------- ON Org2  -----------------------

. ./switchPeer.sh 20
 
peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID}$ # >&log.txt
peer lifecycle chaincode install ${CC_NAME}.tar.gz # >&log.txt

. ./switchPeer.sh 21
 
peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID}$ # >&log.txt
peer lifecycle chaincode install ${CC_NAME}.tar.gz # >&log.txt
   
peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID}$ # >&log.txt


## approve the definition for org2
# approveForMyOrg 2
    peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${SEQUENCE} # >&log.txt

# setGlobals
  peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --sequence ${SEQUENCE} --output json # >&log.txt

# approveForMyOrg 1 peer0
. ./switchPeer.sh 10
      peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${SEQUENCE} # >&log.txt
# checkCommitReadiness
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --sequence ${SEQUENCE} --output json # >&log.txt

# approveForMyOrg 1 peer1
# . ./switchPeer.sh 11
#       peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence 1 # >&log.txt
# checkCommitReadiness
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --sequence ${SEQUENCE} --output json # >&log.txt


# ## now that we know for sure both orgs have approved, commit the definition
# commitChaincodeDefinition 1 2
. ./switchPeer.sh 20
  # peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} "${PEER_CONN_PARMS[@]}" --version ${CC_VERSION} --sequence ${SEQUENCE} >&log.txt
  peer lifecycle chaincode commit -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem" --peerAddresses peer1.org1.example.com:8051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem" --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem" --peerAddresses peer1.org2.example.com:1051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem" --version ${CC_VERSION} --sequence ${SEQUENCE}

sleep 2
## query on both orgs to see that the definition committed successfully
# queryCommitted 1gursewakdhillon@gursewak-TUF:~/fabric-samples$ 

  # setGlobals for peer0.org1
. ./switchPeer.sh 10

  peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

# peer chaincode invoke -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" -C $CHANNEL_NAME -n ${CC_NAME} --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem" --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem" -c '{"function":"'initLedger'","Args":[]}' 

# sleep 2
# peer chaincode query -C ${CHANNEL_NAME} -n  ${CC_NAME} -c '{"Args":["cdbqueryAllCustomers"]}'
# "Dhillons Firm","302 hell garden","Mansa","Punjab","151505","6280052660","zzzzzzzzzzzzzzzzzzzzz","123456789012345","dhillonblock46@gmail.com","dhillon","inactive"