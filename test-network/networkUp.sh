#!/bin/bash

# set -x
export PATH=${PWD}/../bin:$PATH
export VERBOSE=true
export CORE_PEER_TLS_ENABLED=true 
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export CHANNEL_NAME=supplychainchannel


# ==================  FABRIC CA  =================================
. ./fabricCA.sh
# ==================== FABRIC CA MATERIAL CREATED =========================

# ===================== OSNAdmin Joining Channel ============================
. ./osnadmin.sh

# # =====================  Join all the peers to the channel  ============================
. ./peersJoinChannel.sh

# ============================  Set the anchor peers ============================
docker exec cli ./scripts/customToAnchorPeers.sh 

#  ===================== GET OUT OF CONTAINER ===========================================

# ==========================  DEPLOY CHAINCODE  ============================================
. ./deployChaincode.sh 1