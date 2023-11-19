set -x
export PATH=${PWD}/../../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export VERBOSE=false

export PEER0_ORG3_CA=${PWD}/../organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=localhost:11051

docker-compose -f compose/compose-ca-org3.yaml -f compose/docker/docker-compose-ca-org3.yaml up -d
sleep 3
mkdir -p ../organizations/peerOrganizations/org3.example.com/

export FABRIC_CA_CLIENT_HOME=${PWD}/../organizations/peerOrganizations/org3.example.com/

fabric-ca-client enroll -u https://admin:adminpw@localhost:11054 --caname ca-org3 --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"


echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml"

# registering peer 0
  fabric-ca-client register --caname ca-org3 --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
# registering user
  fabric-ca-client register --caname ca-org3 --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
# registering org admin 
  fabric-ca-client register --caname ca-org3 --id.name org3admin --id.secret org3adminpw --id.type admin --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
# generating peer0 msg
	fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp" --csr.hosts peer0.org3.example.com --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/config.yaml"
# generating peer 0 tls certificates
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls" --enrollment.profile tls --csr.hosts peer0.org3.example.com --csr.hosts localhost --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"



  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/signcerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/server.crt"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/keystore/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/server.key"

  mkdir "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/tlscacerts"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/tlscacerts/ca.crt"

  mkdir "${PWD}/../organizations/peerOrganizations/org3.example.com/tlsca"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem"

  mkdir "${PWD}/../organizations/peerOrganizations/org3.example.com/ca"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/cacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/ca/ca.org3.example.com-cert.pem"

# generating user msp
	fabric-ca-client enroll -u https://user1:user1pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/User1@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/User1@org3.example.com/msp/config.yaml"

# generating org admin msp

	fabric-ca-client enroll -u https://org3admin:org3adminpw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp/config.yaml"
register


# generating ccp file 
./ccp-generate.sh


export FABRIC_CFG_PATH=$PWD

configtxgen -printOrg Org3MSP > ../organizations/peerOrganizations/org3.example.com/org3.json

DOCKER_SOCK=/var/run/docker.sock docker-compose -f compose/compose-org3.yaml -f compose/docker/docker-compose-org3.yaml -f compose/compose-couch-org3.yaml -f compose/docker/docker-compose-couch-org3.yaml up -d

# Generating and submitting config tx to add Org3

docker exec cli ./scripts/org3-scripts/updateChannelConfigCustom.sh supplychainchannel # 3 10 false
docker exec cli ./scripts/org3-scripts/joinChannelCustom.sh supplychainchannel # 3 10 false 


