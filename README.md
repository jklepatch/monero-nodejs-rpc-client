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

## Testing

Testing is done with `mocha`, `chai` and `chai-as-promised` to test promises.

To run the tests:

```
npm run test
```

The tests are located in the `tests.js` file. They perform actual API calls to the monero network through moneroworld. In order to prevent the tests from failing because of a timeout, tests are run with a `timeout` option of 10s. Tests can still fail if moneroworld servers are too slow.

If you want to just run one set of test (i.e a `describe` block), you can do so with this command:
```. In order to prevent the tests from failing because of a timeout, tests are run with a `timeout` option of 10s. Tests can still fail ifmoneroworld servers are too slow.

If you want to just run one set of test (i.e a `describe` block), for let's say the `getBlockTemplate() function, you can do so with this command:

```
./node_modules/mocha/bin/mocha --grep getBlockTemplate --timeout 10000
```

You can be even more specific by adding `only` to the individual tests. Example for `getInfo()`:

```
describe('getInfo()', () => {
  it.only('should successfully retrieve information about the network', () => {
    return expect(rpc.getInfo())
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('top_block_hash');
  });
});
```

## License

This project is licensed under the MIT License
