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
