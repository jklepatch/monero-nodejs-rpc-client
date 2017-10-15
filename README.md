# Monero NodeJS RPC Client

Monero RPC client written with Nodejs.
It produces JSON objects or strings as output, wrapped in
native promises.

All RPC calls are defined here:
https://getmonero.org/resources/developer-guides/daemon-rpc.html

## Getting Started

1. Install the npm package:Create a `node_modules` directory inside your project, if none:

```
cd yourproject
npm install -S monero-rpc-client
```

2. Require the RPC client into your project:

```
const rpcClientClass = require('monero-rpc-client');
const NODE_ADDRESS = 'http://[urltonode|iptonode]:port';
//decodeJSON is an optional boolean argument. 
//When set to true (default), the JSON string response is
//parsed into a JSON object. Otherwise the string is returned.
const rpcClient = new rpcClientClass(NODE_ADDRESS [, decodeJSON]);
```

3. Use methods attached to `rpcClient` to send RPC calls:

### Example
```
//Some method dont require arguments:
rpcClient.getBlockCount();
  .then((result) => {
    console.log(result);
    /**
     * print:
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
    //Deal with your error here
  });

//Some method require arguments.
rpcClient.getBlockHeaderByHeight({height: 1000});
  .then((result) => {
    console.log
    /**
     * print:
     * {
     *  "id": "0",
     * "jsonrpc": "2.0",
     *  "result": {
     *    "block_header": {
     *      "depth": 78376,
     *      "difficulty": 815625
     *      ...
     *      ...
     *     }
     *   }
     * }
     */
```
### Promise-wrapped responses
All method calls return native Nodejs promises. You need to use the
`then()` / `catch()` pattern shown above. If the call was succesful,
the data will be passed to `then()`, otherwise the error will be passed
to `catch()`. 

### Method Names
The method calls are the camel-case version of the original RPC methods defined
on the Monero website.
(See https://getmonero.org/resources/developer-guides/daemon-rpc.html)

Example1: on the Monero website `getblockheaderbyhash` is called with `height`
For the Nodejs client, the method is `getBlockHeaderByHash` and the argument to
query height 12345 will be this object: {height: 12345}

Example2: on the Monero website there a RPC call `get_transaction_pool`
For the Nodejs client, the method is `getTransactionPool` 

### Arguments
The arguments to use for those methods are detailed in the inline documentation of 
the `index.js`. There are the same as those mentioned in the Monero documentation:
https://getmonero.org/resources/developer-guides/daemon-rpc.html#getblockheaderbyheight

### Returned value
If you havent specified any `decodeJSON` argument when you
instantiated `rpcClient`, by default the returned data will already be parsed
into a JSON object for you. Otherwise you will receive the original JSON string
returned by the Monero network.

## Testing

Testing is done with `mocha`, `chai` and `chai-as-promised` to test promises.

To run the tests:

```
npm run test
```

The tests are located in the `tests.js` file. They perform actual API calls to the monero network through moneroworld. In order to prevent the tests from failing because of a timeout, tests are run with a `timeout` option of 10s. Tests can still fail if moneroworld servers are too slow.

If you want to just run one set of test (i.e a `describe` block), for let's say the `getBlockTemplate() function, you can do so with this command:

```
./node_modules/mocha/bin/mocha --grep [functionNameHere] --timeout 10000
```
For example, if you want to test `getBlockTemplate`:
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
