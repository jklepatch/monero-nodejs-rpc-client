const rpcClass = require('monero-rpc-client'); 

const WALLET_ADDRESS = '46sKRpY9ULrhA7QVWxZ1VPWmTeU56CBfUNeCey5xDRsBMXnxP5fyBvYWYTH5xEnPuUJtiHcJNHJZ9fgsfkxbAS2zVhS7DBm';
const NODE_ADDRESS = 'http://node.moneroworld.com:18089';

const rpc = new rpcClass(NODE_ADDRESS, WALLET_ADDRESS);

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('rpcClient Class', () => {
  it('should instantiate correctly', () => {
    const rpc = new rpcClass('MyNodeAddress', 'MyWalletAddress');
    expect(rpc).to.have.property('nodeAddress', 'MyNodeAddress');
    expect(rpc).to.have.property('walletAddress', 'MyWalletAddress');
  });
});

describe('getBlockCount()', () => {
  it('should retrieve block count', () => {
    return expect(rpc.getBlockCount())
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('"count":');
  });
});

describe('on_getblockhash()', () => {
  it('should retrieve block hash', () => {
    return expect(rpc.onGetBlockHash(1000))
            .to
            .eventually
            .contain('"result"');
  });
});

describe('getBlockTemplate()', () => {
  /**
   * Successfuly calls
   */
  it('should retrieve block template with object argument', () => {
    const args = ({
                    wallet_address: WALLET_ADDRESS,
                    reserve_size: 8
                 });
    return expect(rpc.getBlockTemplate(args))
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('"blocktemplate_blob"');
  });

  /**
   * Unsuccesful calls
   */
  it('should NOT retrieve block template with a non-object argument', () => {
    return expect(rpc.getBlockTemplate(''))
            .to
            .be
            .rejected;
  });

   // `wallet_address` field
  it('should NOT retrieve block template with missing `wallet_address` field', () => {
    return expect(rpc.getBlockTemplate({reserve_size: 8}))
            .to
            .be
            .rejected;
  });
  it('should NOT retrieve block template with empty `wallet_address` field', () => {
    return expect(rpc.getBlockTemplate({wallet_address: '', reserve_size: 8}))
            .to
            .be
            .rejected;
  });
  it('should NOT retrieve block template with wrong `wallet_address` field', () => {
    return expect(rpc.getBlockTemplate({wallet_address: 12345678, reserve_size: 8}))
            .to
            .be
            .rejected;
  });

   // `reserve_size` field
  it('should NOT retrieve block template with missing `reserve_size` field', () => {
    return expect(rpc.getBlockTemplate({wallet_address: WALLET_ADDRESS}))
            .to
            .be
            .rejected;
  });
  it('should NOT retrieve block template with wrong `reserve_size` field', () => {
    return expect(rpc.getBlockTemplate(
            {
              wallet_address: WALLET_ADDRESS, 
              reserve_size: 'Im the wrong type'
            }))
            .to
            .be
            .rejected;
  });

});

/**
 * @TODO: build blob data
 */
//describe('submitBlock()', () => {
//  it('should successfully submit block', () => {
//    return expect(rpc.submitBlock('blob data here'))
//            .to
//            .eventually
//            .contain('"status": "OK"');
//  });
//});

describe('getLastBlockHeader()', () => {
  it('should successfully retrieve last block header', () => {
    return expect(rpc.getLastBlockHeader())
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('"block_header"');
  });
});

describe('getBlockHeaderByHash()', () => {
  it('should successfully retrieve the block header referenced by its hash object', () => {
    const args = {hash: 'e22cf75f39ae720e8b71b3d120a5ac03f0db50bba6379e2850975b4859190bc6'};
    return expect(rpc.getBlockHeaderByHash(args))
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('"block_header"');
  });
});

describe('getBlockHeaderByHeight()', () => {
  it('should successfully retrieve the block header referenced by its height', () => {
    const args = {height: 912345};
    return expect(rpc.getBlockHeaderByHeight(args))
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('"block_header"');
  });
});

describe('getBlock()', () => {
  it('should successfully retrieve the block referenced by its height', () => {
    const args = {height: 912345};
    return expect(rpc.getBlock(args))
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('"block_header"')
            .and
            .contain('"json":');
  });
});

/**
 * @TODO: find why it doesnt work. Maybe moneronode doesnt allow this method?
 */
//describe('getConnections()', () => {
//  it('should successfully retrieve connections info', () => {
//    return expect(rpc.getConnections())
//            .to
//            .eventually
//            .contain('"status": "OK"')
//            .and
//            .contain('connections');
//  });
//});
//

describe('getInfo()', () => {
  it('should successfully retrieve information about the network', () => {
    return expect(rpc.getInfo())
            .to
            .eventually
            .contain('"status": "OK"')
            .and
            .contain('top_block_hash');
  });
});


describe('hardForkInfo()', () => {
  it('should successfully retrieve hard fork info', () => {
    return expect(rpc.hardForkInfo())
            .to
            .eventually
            .contain('earliest_height');
  });
});

/**
 * Not possible to test this with moneroworld (make sense)
 */
//describe('setBans()', () => {
//  it('should successfully bans a list of ips for a set duration', () => {
//    const bans = {
//      ip: 12.12.12.12,
//      ban: true,
//      seconds: 1000
//    };
//    return expect(rpc.setBans(bans))
//            .to
//            .eventually
//            .contain('"status": "OK"');
//  });
//});

/**
 * Not possible to test this with moneroworld (make sense)
 */
//describe('getBans()', () => {
//  it('should successfully retrieve list of banned nodes', () => {
//    return expect(rpc.getBans())
//            .to
//            .eventually
//            .contain('bans')
//            .and
//            .contain('"status": "OK"');
//  });
//});

describe('getHeight()', () => {
  it('should successfully retrieve the current height', () => {
    return expect(rpc.getHeight())
            .to
            .eventually
            .contain('height')
            .and
            .contain('"status": "OK"');
  });
});

describe('getTransactions()', () => {
  it('should successfully retrieve a few transactions by hash with JSON', () => {
    const txs_hashes = ["d6e48158472848e6687173a91ae6eebfa3e1d778e65252ee99d7515d63090408"];
    const decode_as_json = true;
    return expect(rpc.getTransactions({txs_hashes, decode_as_json}))
            .to
            .eventually
            .contain("txs_as_hex")
            .and
            .contain('txs_as_json')
            .and
            .contain('"status": "OK"');
  });
  it('should successfully retrieve a few transactions by hash', () => {
    const txs_hashes = ["d6e48158472848e6687173a91ae6eebfa3e1d778e65252ee99d7515d63090408"];
    const decode_as_json = false;
    return expect(rpc.getTransactions({txs_hashes, decode_as_json}))
            .to
            .eventually
            .contain('txs_as_hex')
            .and
            .contain('"status": "OK"');
  });
});

describe('isKeyImageSpent()', () => {
  it('should successfully retrieve the spend status of an array of key images', () => {
    const key_images = ["8d1bd8181bf7d857bdb281e0153d84cd55a3fcaa57c3e570f4a49f935850b5e3","7319134bfc50668251f5b899c66b005805ee255c136f0e1cecbb0f3a912e09d4"];
    return expect(rpc.isKeyImageSpent({key_images}))
            .to
            .eventually
            .contain('spent_status')
            .and
            .contain('"status": "OK"');
  });
});

/**
 * @TODO: Build a tx_as_hex to test
 */
//describe('sendRawTransaction()', () => {
//  it('should successfully send a raw transaction', () => {
//    const tx_as_hex = "ae634..";
//    return expect(rpc.sendRawTransaction({tx_as_hex}))
//            .to
//            .eventually
//            .contain('"status": "OK"');
//  });
//});
