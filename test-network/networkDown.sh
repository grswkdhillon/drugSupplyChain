#!/bin/bash
# =============================================================================================
# =====================        NETWORK DOWN         =========================================
# ===========================================================================================


# DOCKER_SOCK=/var/run/docker.sock  docker-compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml -f compose/compose-couch.yaml -f compose/docker/docker-compose-couch.yaml -f compose/compose-ca.yaml -f compose/docker/docker-compose-ca.yaml down --volumes --remove-orphans

# docker rm -f $(docker ps -aq --filter label=service=hyperledger-fabric) 2>/dev/null || true
# docker rm -f $(docker ps -aq --filter name='dev-peer*') 2>/dev/null || true

# docker image rm -f $(docker images -aq --filter reference='dev-peer*') 2>/dev/null || true

# docker kill $(docker ps -q --filter name=ccaas) || true
# # docker volume rm docker_orderer.example.com docker_peer0.org1.example.com docker_peer0.org2.example.com

# # remove orderer block and other channel configuration transactions and certs
# docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf system-genesis-block/*.block organizations/peerOrganizations organizations/ordererOrganizations'
# docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf channel-artifacts log.txt *.tar.gz'




COMPOSE_BASE_FILES="-f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml"
COMPOSE_COUCH_FILES="-f compose/compose-couch.yaml -f compose/docker/docker-compose-couch.yaml"
COMPOSE_CA_FILES="-f compose/compose-ca.yaml -f compose/docker/docker-compose-ca.yaml"
COMPOSE_FILES="${COMPOSE_BASE_FILES} ${COMPOSE_COUCH_FILES} ${COMPOSE_CA_FILES}"

DOCKER_SOCK=/var/run/docker.sock docker-compose ${COMPOSE_FILES} down --volumes --remove-orphans

docker volume rm docker_orderer.example.com docker_peer0.org1.example.com docker_peer0.org2.example.com compose_peer0.org3.example.com
docker kill $(docker ps -q --filter name=ccaas) || true
# remove orderer block and other channel configuration transactions and certs
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf system-genesis-block/*.block organizations/peerOrganizations organizations/ordererOrganizations'
## remove fabric ca artifacts   
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/org1/msp organizations/fabric-ca/org1/tls-cert.pem organizations/fabric-ca/org1/ca-cert.pem organizations/fabric-ca/org1/IssuerPublicKey organizations/fabric-ca/org1/IssuerRevocationPublicKey organizations/fabric-ca/org1/fabric-ca-server.db'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/org2/msp organizations/fabric-ca/org2/tls-cert.pem organizations/fabric-ca/org2/ca-cert.pem organizations/fabric-ca/org2/IssuerPublicKey organizations/fabric-ca/org2/IssuerRevocationPublicKey organizations/fabric-ca/org2/fabric-ca-server.db'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/ordererOrg/msp organizations/fabric-ca/ordererOrg/tls-cert.pem organizations/fabric-ca/ordererOrg/ca-cert.pem organizations/fabric-ca/ordererOrg/IssuerPublicKey organizations/fabric-ca/ordererOrg/IssuerRevocationPublicKey organizations/fabric-ca/ordererOrg/fabric-ca-server.db'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/ordererOrg2/msp organizations/fabric-ca/ordererOrg2/tls-cert.pem organizations/fabric-ca/ordererOrg2/ca-cert.pem organizations/fabric-ca/ordererOrg2/IssuerPublicKey organizations/fabric-ca/ordererOrg2/IssuerRevocationPublicKey organizations/fabric-ca/ordererOrg2/fabric-ca-server.db'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf addOrg3/fabric-ca/org3/msp addOrg3/fabric-ca/org3/tls-cert.pem addOrg3/fabric-ca/org3/ca-cert.pem addOrg3/fabric-ca/org3/IssuerPublicKey addOrg3/fabric-ca/org3/IssuerRevocationPublicKey addOrg3/fabric-ca/org3/fabric-ca-server.db'
# remove channel and script artifacts
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf channel-artifacts log.txt *.tar.gz'

docker rm -f $(docker ps -aq --filter label=service=hyperledger-fabric) 
docker rm -f $(docker ps -aq --filter name='dev-peer*') 
# docker rmi -f $(docker images -aq --filter name='dev-peer*') 
docker rmi $(docker images | awk '{if ($1 ~ "^dev") print $1":"$2}')

