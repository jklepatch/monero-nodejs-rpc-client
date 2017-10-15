/**
 * Require and instantiate the rpc client
 */
//In your code it will be RpcClientClass = require('monero-nodejs-rpc-client');
const RpcClientClass = require('./main.js');

//If you don't have any daemon node setup,
//you can use moneroworld nodes, but some RPC calls will
//not work, like setBans().
const NODE_ADDRESS = 'http://node.moneroworld.com:18089';

//RpcClientClass(NODE_ADDRESS, false) if you want JSON string response instead of JSON object
const rpcClient = new RpcClientClass(NODE_ADDRESS); 


/**
 * getblockcount
 */
rpcClient.getBlockCount()
  .then((data) => {
    console.log(data);
    /**
     * {  
     *   "id": "0",  
     *   "jsonrpc": "2.0",  
     *   "result": {  
     *     "count": 9933,  
     *     "status": "OK"  
     *   }  
     * } 
     */
  })
  .catch((err) => {
    console.log(err);
  });

/**
 * on_getblockhash
 * called with an array of block height
 */
rpcClient.onGetBlockHash([912345, 912346])
  .then((data) => {
    console.log(data);
    /**
     * print:
     * {
     *   "id": "0",
     *   "jsonrpc": "2.0",
     *   "result": "e22cf75f39ae720e8b71b3d120a5ac03f0db50bba6379e2850975b4859190bc6"
     * }
     */
  })
  .catch((err) => {
    console.log(err);
  });

/**
 * getblocktemplate
 */
const WALLET_ADDRESS = '46sKRpY9ULrhA7QVWxZ1VPWmTeU56CBfUNeCey5xDRsBMXnxP5fyBvYWYTH5xEnPuUJtiHcJNHJZ9fgsfkxbAS2zVhS7DBm';
rpcClient.getBlockTemplate({wallet_address: WALLET_ADDRESS, reserve_size: 8})
  .then((data) => {
    console.log(data);
    /**
     * print:
     * {
     *   "id": "0",
     *   "jsonrpc": "2.0",
     *   "result": {
     *     "blocktemplate_blob": "01029af88cb...",
     *     "difficulty": 982540729,
     *     "height": 993231,
     *     "prev_hash": "68b84a11dc9406ace9e635918ca03b008f7728b9726b327c1b482a98d81ed830",
     *     "reserved_offset": 246,
     *     "status": "OK"
     *   }
     * }
     */
  })
  .catch((err) => {
    console.log(err);
  });

/**
 * submitblock
 */
rpcClient.submitBlock("78sffssfsf28742sf...")
  .then((data) => {
    console.log(data);
    /**
     * print:
     * {
     *   "id": "0",
     *   "jsonrpc": "2.0",
     *   "status": "OK"
     * }
     */
  })
  .catch((err) => {
    console.log(err);
  });
