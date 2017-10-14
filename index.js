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
          req.body= JSON.stringify(params);
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
   *              Link:  {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblockcount}
   * @returns {Promise} - Block count. Example: 
   *                      {  
   *                        "count": 9933,  
   *                        "status": "OK"  
   *                      }  
   */
  getBlockCount() {
    return this._send('getblockcount', undefined, true);
  }

  /**
   * @function onGetBlockHash
   * @description Look up a block's hash by its height.
   *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#on_getblockhash} 
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
   *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblocktemplate} 
   * @param {object} args - 
   *                       {
   *                         wallet_address: {string} - required
   *                         reserve_size: {integer} - required
   *                       }
   * @returns {Promise} - Block template as a string blob, as well as related metadata. Example: 
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
   getBlockTemplate(args) {
     const errMess = `The argument should be an object with following fields:
                      \`wallet_address\` {string} - required \n
                      \`reserve_size\` {integer} = required`;
     if(typeof args !== 'object'
         || typeof args.wallet_address !== 'string'
         || !args.wallet_address
         || args.reserve_size === undefined 
         || typeof args.reserve_size !== 'number'
         || !Number.isInteger(args.reserve_size)) {
       return new Promise((resolve, reject) => {
         reject(new Error(errMess));
       });
     }
     return this._send('getblocktemplate', args);
   }
  
   /**
    * @function submitBlock
    * @description Submit a mined block to the network
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#submitblock}
    * @params {string} blockBlob - hexadecimal string representing the block blob
    * @returns {Promise} - Status field of the response indicate the result. 
    *                      "OK" means block was accepted.
    *                      Example:
    *                      {  
    *                        "id": "0",  
    *                        "jsonrpc": "2.0",  
    *                        "result": {  
    *                          "status": "OK"  
    *                        }  
    *                      }  
    */
   submitBlock(blockBlob) {
     return this._send('submitblock', blockblob);
   }

   /**
    * @function getLastBlockHeader
    * @description Block header information for the most recent block is easily 
    *              retrieved with this method. No inputs are needed.
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getlastblockheader}
    * @returns {Promise} - JSON representation of block header
    *                      Example:
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
   getLastBlockHeader() {
     return this._send('getlastblockheader');
   }

   /**
    * @function getBlockHeaderByHash
    * @description Block header information can be retrieved using either a block's hash or height. 
    *              This method includes a block's hash as an input parameter to retrieve basic 
    *              information about the block.
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblockheaderbyhash}
    * @returns {Promise} - JSON representation of block header. See {@link getLastBlockHeader} for details.
    */
   getBlockHeaderByHash(hash) {
     return this._send('getblockheaderbyhash', hash);
   }

   /**
    * @function getBlockHeaderByHeight
    * @description Similar to getblockheaderbyhash above, this method 
    *              includes a block's height as an input parameter to 
    *              retrieve basic information about the block
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblockheaderbyheight}
    * @params {int} height - The height of the requested block
    * @returns {Promise} - JSON representation of block header. See {@link getLastBlockHeader} for details.
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
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblock}
    * @param {number|string} height - An integer or a hash representing the block
    * @returns {Promise}
    */
   getBlock(height, hash) {
     return this._send('getblock');
   }

   /**
    * @function getConnections
    * @description Retrieve information about incoming and outgoing connections to your node
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#get_connections}
    * @returns {Promise} - JSON representation of connections. Example:
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
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#get_info}
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
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#hard_fork_info 
    * @returns {Promise} - JSON representation of the current hard fork info. Example:
    *                      {
    *                        "id": "0",
    *                        "jsonrpc": "2.0",
    *                        "result": {
    *                          "earliest_height": 1009827,
    *                          "enabled": false,
    *                          "state": 2,
    *                          "status": "OK",
    *                          "threshold": 0,
    *                          "version": 1,
    *                          "votes": 7277,
    *                          "voting": 2,
    *                          "window": 10080
    *                         }
    *                      }
    */
   hardForkInfo() {
     return this._send('hard_fork_info');
   }

   /**
    * @function setBans
    * @description Ban another node by IP
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#setbans}
    * @param {BanList} - List of nodes to be banned
    * @returns {Promise} - Status field indicates the result of the operation.
    *                      "OK" means the ban was succesfully. Example:
    *                      {
    *                        "id": "0",
    *                        "jsonrpc": "2.0",
    *                        "result": {
    *                          "status": "OK"
    *                        }
    *                      }
    */
   setBans(nodes) {
     if(typeof nodes != BanList) throw new Err("Monero Client: setBans() expect a instance of BanList as argument");
     return this._send('setbans');
   }

   /**
    * @function getBans
    * @description Returns the list of currently banned nodes
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getbans}
    * @returns {Promise} - JSON representation of the current bans.
    *                      `seconds` represents the remaining time until ban expire. Example:
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
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#getheight}
    * @returns {Promise} - Example:
    *                      {
    *                        "height": 993488,
    *                        "status": "OK"
    *                      }
    */
   getHeight() {
     return this._send('getheight', undefined, false);
   }

   /**
    * @function gettransactions
    * @description Look up one or more transactions by hash
    *              Link {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#gettransactions}
    * @param {Object} args - {
    *                          {Array} txHashes - Array of transactions hashes
    *                          {Bool} decodeAsJSON - Optional. If set true, the returned 
    *                               transaction information will be decoded rather than binary.
    * @returns {Promise} - Arrays of HEX and JSON representations of transactions. Example:
    *                     {
    *                       "status": "OK",
    *                       "txs_as_hex": ["..."],
    *                       "txs_as_json": ["..."]
    *                     }
    */
   getTransactions({txs_hashes, decode_as_json = true}) {
     return this._send('gettransactions', {txs_hashes, decode_as_json}, false);
   }

   /**
    * @function isKeyImageSpent
    * @params {Array} keyImages - Array of key images to check for
    *                             Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#iskeyimagespent}
    * @returns {Promise} -  List of statuses for each image checked. 
    *                       Statuses are as follow: 
    *                         0 = unspent, 
    *                         1 = spent in blockchain, 
    *                         2 = spent in transaction pool
    *                       Example:
    *                      {
    *                        "spent_status": [1,2],
    *                        "status": "OK"
    *                      }
    */
   isKeyImageSpent({key_images}) {
     return this._send('is_key_image_spent', {key_images}, false);
   }

   /**
    * @function sendRawTransaction
    *
    * @description Show information about valid transactions seen by the node 
    *              but not yet mined into a block, as well as spent key image 
    *              information in the node's memory.
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#send_raw_transaction}
    * @param {String} txAsHex: Full Transaction as hexadecimal string
    * @returns {Promise} - Example:
    *                       '{"tx_as_hex":"de6a3..."}
    */
   sendRawTransaction(txAsHex) {
     return this._send('sendrawtransaction', {tx_as_hex: txAsHex}, false);
   }

   /**
    * @function stopDaemon
    * @description Send a command to the daemon to safely disconnect and shut down.
    *              Link: {@link https://getmonero.org/resources/developer-guides/daemon-rpc.html#stopdaemon}
    * @returns {Promise} - Answer with a status "OK" for successfull stop. Example:
    *                      {
    *                        "status": "OK"
    *                      }
    */
   stopDaemon() {
     return this._send('stop_daemon', undefined, false);
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
