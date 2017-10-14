const net = require('net');
const request = require('request');

/**
 * @class rpcClient
 * @description rpcClient for Monero. The official API documentation is here:
 *              https://getmonero.org/resources/developer-guides/daemon-rpc.htm
 */
class rpcClient {
  /*
   * @function constructor
   * @description Build an instance of `rpcClient`
   * @param {string} nodeAddress - The full address of the daemon node to connect to
   *                               Example1: 'http://mynodeurl:30400'
   *                               Example2: 'http://12.34.345.12:30400'
   * @param {string} walletAddress - A Monero wallet address used in certain method calls.
   *
   *                                 For example, it used in `getBlockTemplate` to know
   *                                 which wallet will receive the coinbase transaction
   *                                 if the block is succesfully mined.
   *
   *                                 For testing, a Monero wallet can be created easily
   *                                 on https://moneroaddress.org
   */
  constructor(nodeAddress, walletAddress) {
    this.nodeAddress = nodeAddress;
    this.walletAddress = walletAddress;
  }
  
  /**
   * @function _send
   * @description Send the request to the daemon
   * @private
   * @param {string} method - the name of the RPC method
   * @param {object|array} params - Parameters to be passed to the RPC method
   * @param {bool} isJSONRPC - The RPC interface of Monero has 2 interfaces
   *                           * The JSON RPC one, where '/json_rpc' has to
   *                             be appended after the URL of the daemon node
   *                           * The other one, where nothing needs to be appended
   * @returns {Promise} - A Promise which is resolved if the request succesfully
   *                      fetch the data, and rejected otherwise. Failure can happen
   *                      either because of a problem of the request, or before the 
   *                      request happen, when `JSON.stringify` fails
   */
  _send(method, params = undefined, isJSONRPC = true) {
    return new Promise((resolve, reject) =>  {
      const req = {};
      /**
       * Some RPC method follows JSON RPC calling conventions (first branch of the if)
       * Some others follow another calling convention (second branch of the if);
       */
      if(isJSONRPC) {
        req.url = this.nodeAddress + '/json_rpc';
        try {
          const payload = JSON.stringify({
            jsonrpc: "2.0",
            id: "0",
            method: method,
            params: params
          });
          req.body = payload;
        }
        catch(err) {
          return reject(err);
        }
      } else {
        req.url = this.nodeAddress + '/' + method;
        try {
          req.body= JSON.stringify({params});
        }
        catch(err) {
          return reject(err);
        }
      }
      request.post(req, function(err, req, data) {
        if(err) return reject(err);
        resolve(data);
      });
    });
  }
  
  /**
   * @function getBlockCount
   * @description Look up how many blocks are in the longest chain known to the node.
   *              Link:  https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblockcount
   * @returns {Promise} - Example: 
   *                      {  
   *                        "count": 993<t_co>3,  
   *                        "status": "OK"  
   *                      }  
   */
  getBlockCount() {
    return this._send('getblockcount', undefined, true);
  }

  /**
   * @function onGetBlockHash
   * @description Look up a block's hash by its height.
   *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#on_getblockhash 
   * @param {int} height - height of the block we want to find
   * @returns {Promise} - Block hash. Example:
   *                      {
   *                        "id": "0",
   *                        "jsonrpc": "2.0",
   *                        "result": "e22cf75f39ae720e8b71b3d120a5ac03f0db50bba6379e2850975b4859190bc6"
   *                      }   
   */
  onGetBlockHash(height) {
    return this._send('on_getblockhash', [height])
  }

  /*
   * @function getBlockTemplate
   * @description Get a block template for mining a block
   *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblocktemplate 
   * @param {int} reserveSize - Reserve size
   * @returns {Promise} - Block templateExample: 
   *                      {
   *                        "id": "0",
   *                        "jsonrpc": "2.0",
   *                        "result": {
   *                          "blocktemplate_blob": "01029af88..."
   *                          "difficulty": 982540729,
   *                          "height": 993231,
   *                          "prev_hash": "68b84a11dc...",
   *                          "reserved_offset": 246,
   *                        "status": "OK"
   *                      }
   */
   getBlockTemplate(walletAddress, reserveSize) {
     return this._send('getblocktemplate', walletAddress, reserveSize);
   }
  
   /**
    * @TODO: functions below need to be documented and tested
    */

   /**
    * @function submitBlock
    * @description
    * @params
    * @returns {Promise} - Example:
    */
   submitBlock(blockBlob) {
     return this._send('submitblock', blockblob);
   }

   /**
    * @function getLastBlockHeader
    * @description
    * @params
    * @returns {Promise} - Example:
    */
   getLastBlockHeader() {
     return this._send('getlastblockheader');
   }

   /**
    * @function getBlockHeaderByHash
    * @returns {Promise} - Example:
    */
   getBlockHeaderByHash() {
     return this._send('getlastblockheaderbyhash');
   }

   /**
    * @function getBlockHeaderByHeight
    * @description Similar to getblockheaderbyhash above, this method 
    *              includes a block's height as an input parameter to 
    *              retrieve basic information about the block
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblockheaderbyheight
    * @params {int} height - The height of the requested block
    * @returns {Promise} - Example:
    *                      {
    *                        "id": "0",
    *                        "jsonrpc": "2.0",
    *                        "result": {
    *                          "block_header": {
    *                            "depth": 78376,
    *                            "difficulty": 815625611,
    *                            "hash": "e22cf75f39...",
    *                            "height": 912345,
    *                            "major_version": 1,
    *                            "minor_version": 2,
    *                            "nonce": 46,
    *                            "orphan_status": false,
    *                            "prev_hash": "b61c58b2e0b...",
    *                            "reward": 7388968946286,
    *                            "timestamp": 14527937
    *                          },
    *                          "status": "OK"
    *                        }
    *                      }
    */
   getBlockHeaderByHeight(height) {
     return this._send('getblockheaderbyheight');
   }

   /**
    * @function getBlock
    * @description Full block information can be retrieved by 
    *              either block height or hash, like with the above 
    *              block header calls. For full block information, both 
    *              lookups use the same method, but with different input parameters.
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblock
    * @param {Int} height -
    * @param {String} hash -
    * @returns {Promise}
    */
   getBlock(height, hash) {
     return this._send('getblock');
   }

   /**
    * @function getConnections
    * @description Retrieve information about incoming and outgoing connections to your node
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#get_connections
    * @returns {Promise} - Example:
    *                      {
    *                        "id": "0",
    *                        "jsonrpc": "2.0",
    *                        "result": {
    *                          "connections": [{
    *                            "avg_download": 0,
    *                            "avg_upload": 0,
    *                            "current_download": 0,
    *                            "current_upload": 0,
    *                            "incoming": false,
    *                            "ip": "76.173.170.133",
    *                            "live_time": 1865,
    *                            "local_ip": false,
    *                            "localhost": false,
    *                            "peer_id": "3bfe29d6b1aa7c4c",
    *                            "port": "18080",
    *                            "recv_count": 396,
    *                            "recv_idle_time": 23,
    *                            "send_count": 176893,
    *                            "send_idle_time": 1457726610,
    *                            "state": "state_normal"
    *                          },
    *                          {
    *                            ...
    *                          }],
    *                          "status": "OK"
    *                        }
    *                      }
    */
   getConnections() {
     return this._send('get_connections');
   }

   /**
    * @function getInfo
    * @description Retrieve general information about the state of your node and the network.
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#get_info
    * @returns {Promise} - Example:
    *                      {
    *                        "id": "0",
    *                        "jsonrpc": "2.0",
    *                        "result": {
    *                          "alt_blocks_count": 5,
    *                          "difficulty": 5250,
    *                          "grey_peerlist_size": 2280,
    *                          "height": 993145,
    *                          "incoming_connections_count": 0,
    *                          "outgoing_connections_count": 8,
    *                          "status": "OK",
    *                          "target": 60,
    *                          "target_height": 993137,
    *                          "testnet": false,
    *                          "top_block_hash": "",
    *                          "tx_count": 564287,
    *                          "tx_pool_size": 45,
    *                          "white_peerlist_size": 529
    *                         }
    *                       }
    */
   getInfo() {
     return this._send('get_info');
   }

   /**
    * @function hardForkInfo
    * @description Look up information regarding hard fork voting and readiness.
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#hard_fork_info 
    * @returns {Promise} - Example:
    */
   HardForkInfo() {
     return this._send('hard_fork_info');
   }

   /**
    * @function setBans
    * @description Ban another node by IP
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#setbans
    * @param {BanList} - List of nodes to be banned
    * @returns {Promise} - Example:
    */
   setBans(nodes) {
     if(typeof nodes != BanList) throw new Err("Monero Client: setBans() expect a instance of BanList as argument");
     return this._send('setbans');
   }

   /**
    * @function getBans
    * @description Returns the list of currently banned nodes
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#getbans
    * @returns {Promise} - Example:
    *                      {
    *                        "id": "0",
    *                        "jsonrpc": "2.0",
    *                        "result": {
    *                          "bans": [{
    *                            "ip": 838969536,
    *                            "seconds": 1457748792
    *                           }],
    *                         "status": "OK"
    *                         }
    *                       }
    */
   getBans() {
     return this._send('getbans');
   }

   /**
    * Other Daemon RPC Calls
    */

   /**
    * @function getHeight
    * @description Get the node's current height
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#getheight
    * @returns {Promise} - Example:
    *                      {
    *                        "height": 993488,
    *                        "status": "OK"
    *                      }
    */
   getHeight() {
     return this._send('getheight', undefined, true);
   }

   /**
    * @function gettransactions
    * @description Look up one or more transactions by hash
    *              Link https://getmonero.org/resources/developer-guides/daemon-rpc.html#gettransactions
    * @params {Array} txHashes - Array of transactions hashes
    * @params {Bool} decodeAsJSON - Optional. If set true, the returned 
    *                               transaction information will be decoded rather than binary.
    * @returns {Promise} - Example:
    */
   getTransactions(txHashes, decodeAsJSON = false) {
     return this._send('gettransactions', {tx_hashes: txHashes, decode_as_json: decodeAsJSON}, true);
   }

   /**
    * @function isKeyImageSpent
    * @params {Array} keyImages - Array of key images to check for
    *                             Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#iskeyimagespent
    * @returns {Promise} - Example:
    */
   isKeyImageSpent(keyImages) {
     return this._send('is_key_image_spent', {key_images: keyImages}, true);
   }

   /**
    * @function sendRawTransaction
    *
    * @description Show information about valid transactions seen by the node 
    *              but not yet mined into a block, as well as spent key image 
    *              information in the node's memory.
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#send_raw_transaction
    * @param {String} txAsHex: Full Transaction as hexadecimal string
    * @returns {Promise} - Example:
    *                       '{"tx_as_hex":"de6a3..."}
    */
   sendRawTransaction(txAsHex) {
     return this._send('sendrawtransaction', {tx_as_hex: txAsHex}, true);
   }

   /**
    * @function stopDaemon
    * @description Send a command to the daemon to safely disconnect and shut down.
    *              Link: https://getmonero.org/resources/developer-guides/daemon-rpc.html#stopdaemon
    * @returns {Promise} - Example:
    */
   stopDaemon() {
     return this._send('stop_daemon', undefined, true);
   }
}

/**
 * @class BanList
 * @description Represent a node to ban.
 *              Used as `setbans()` argument.
 */
class BanList {
  constructor() {
    this.bans = [];
  }
  add(ip, ban, seconds) {
    const entry = {
      ip: ip,
      ban: ban,
      seconds: seconds
    };
    this.bans.push(entry);
  }
}

/*
 * @TODO: expose properly BanList and rpcClient
 */
//module.exports = banList;
module.exports = rpcClient;
