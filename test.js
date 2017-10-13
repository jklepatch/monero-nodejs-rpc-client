const rpcClass = require('monero-rpc-client'); 

const WALLET_ADDRESS = '46sKRpY9ULrhA7QVWxZ1VPWmTeU56CBfUNeCey5xDRsBMXnxP5fyBvYWYTH5xEnPuUJtiHcJNHJZ9fgsfkxb    AS2zVhS7DBm';
const NODE_ADDRESS = 'http://node.moneroworld.com:18089';

const rpc = new rpcClass(NODE_ADDRESS, WALLET_ADDRESS);

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe("rpcClient Class", () => {
  it("should instantiate correctly", () => {
    const rpc = new rpcClass("MyNodeAddress", "MyWalletAddress");
    expect(rpc).to.have.property("nodeAddress", "MyNodeAddress");
    expect(rpc).to.have.property("walletAddress", "MyWalletAddress");
  });
});

describe("getBlockCount()", () => {
  it("should retrieve block count", () => {
    return expect(rpc.getBlockCount()).to.eventually.contain('"status": "OK"');
  });
});

