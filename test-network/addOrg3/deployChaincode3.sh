export PEER0_ORG3_CA=${PWD}/../organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=localhost:11051
export FLAG=true


export FABRIC_CFG_PATH=$PWD/../../config/
export PATH=${PWD}/../../bin:$PATH
export VERBOSE=true
export CORE_PEER_TLS_ENABLED=true 
export CHANNEL_NAME=supplychainchannel
export ORDERER_CA=${PWD}/../organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem

export CC_NAME=supplychain
export CC_SRC_PATH=${PWD}/../../chaincode/chaincode
export CC_RUNTIME_LANGUAGE=node
export CC_VERSION=1.0
export SEQUENCE=${1}
# export PACKAGE_ID=peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID}$ 

peer lifecycle chaincode install ./../${CC_NAME}.tar.gz # >&log.txt


peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${SEQUENCE} # >&log.txt
