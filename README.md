# Monero NodeJS RPC Client

RPC client written for Monero, written in Javascript with Nodejs.

-- Unfinished --

All RPC calls are defined here:
https://getmonero.org/resources/developer-guides/daemon-rpc.html

## Getting Started

This library is intended to be used within an existing Nodejs project.
Include it in your `node_modules` folder, then require it from your

1. Create a `node_modules` directory inside your project, if none
```
cd yourproject
mkdir -p node_modules
```

2. Clone the repo into your project `node_modules` directory:
```
git clone https://github.com/jklepatch/monero-nodejs-rpc-client
mv monero-nodejs-rpc-client node_modules/monero-nodejs-rpc-client
```
3. Install dependencies
In your main project `package.json`, add this line
under the `"dependencies"` key (create this key if it doesnt exist):
```
{
  ...
  "dependencies": {
    "monero-nodejs-rpc-client": "./node_modules/monero-nodes-rpc-client"
  }
}
```

4. Require the rpc client into your project:
```
const rpcClientClass = require('monero-nodejs-rpc-client');
const NODE_ADDRESS = 'http://[urltonode|iptonode]:port';
const WALLET_ADDRESS = 'yourmonerowallethere';
const rpcClient = new rpcClientClass(NODE_ADDRESS, WALLET_ADDRESS);
```

4. Send RPC method calls with the methods attached to `rpcClient`
```
/**
 * The method calls are the capitalized version of the original RPC methods defined
 * on the documentation of the Monero website.
 */

//Some method dont require arguments:
var blockCount = rpcClient.getBlockCount();

//Some do:
var blockHash = rpcClient.onGetBlockHash(1000);
```

## License

This project is licensed under the MIT License
