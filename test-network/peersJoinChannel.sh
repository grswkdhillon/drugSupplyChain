FABRIC_CFG_PATH=$PWD/../config/

. ./switchPeer.sh 10
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block # >&log.txt # It throws an error without above command 

# Error: error getting endorser client for channel: endorser client failed to connect to localhost:7051: failed to create new connection: context deadline exceeded
# Then we set export CORE_PEER_TLS_ENABLED=true

. ./switchPeer.sh 20
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block # >&log.txt # It throws an error without above command 

. ./switchPeer.sh 11
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block

. ./switchPeer.sh 21
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block # >&log.txt # It throws an error without above command 
