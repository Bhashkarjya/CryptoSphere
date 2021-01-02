const Blockchain = require('../blockchain/index');
const Block = require('./block');
const cryptoHash=require('../util/crypto-hash');

describe('Blockchain()', () => {
    let blockchain,newChain,originalChain;
    
    beforeEach(() => {
        blockchain=new Blockchain();
        newChain= new Blockchain();
        originalChain=blockchain.chain;
    });

    it('contains a `chain` Array instance',() => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block',() => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the blockchain',() => {
        const newData = 'foo-data';
        blockchain.addBlock({data: newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the blockchain does not start with the genesis block',() => {
            it('returns false',() => {
                blockchain.chain[0] = { data: 'fake-genesis-block'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the blockchain starts with the genesis block and contains multiple blocks',() => {
            
            beforeEach(() => {
                blockchain.addBlock({ data: 'Beatles'});
                blockchain.addBlock({ data: 'Scorpions'});
                blockchain.addBlock({ data: 'Linkin-Park'});
            });

            describe('and a lastHash reference has changed',() => {
                it('returns false',() => {
                    blockchain.chain[2].lastHash='broken-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with an invalid field',() => {
                it('returns false',() => {
                    blockchain.chain[2].data='some-wrong-and-invalid-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks',() => {
                it('returns true',() => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

            describe('and the chain contains a jumped difficulty', () => {
                it('returns false', ()=> {
                    const lastBlock=blockchain.chain[blockchain.chain.length-1];
                    const lastHash=lastBlock.hash;
                    const timestamp= Date.now();
                    const nonce=0;
                    const data=[];
                    const difficulty=lastBlock.difficulty-3;
                    const hash=cryptoHash(timestamp,lastHash,difficulty,nonce,data);

                    const badBlock = new Block({
                        timestamp,lastHash,hash,data,nonce,difficulty
                    });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
        });
    });

    describe('isReplaceChain()', ()=> {
        let errorMock,logMock;
        beforeEach(() => {
            errorMock=jest.fn();
            logMock=jest.fn();
            global.console.error=errorMock;
            global.console.log=logMock;
        });
        describe('when the new chain is not longer',() => {
            beforeEach(() => {
                newChain.chain[0]={new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });
            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });
            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            })
        });
        describe('when the new chain is longer',() => {
            beforeEach(() => {
                newChain.addBlock({ data: 'Beatles'});
                newChain.addBlock({ data: 'Scorpions'});
                newChain.addBlock({ data: 'Linkin-Park'});
            });
            describe('and the chain is not valid',() => {
                beforeEach(() => {
                    newChain.chain[2].hash='fake-illegal-hash';
                    blockchain.replaceChain(newChain.chain);
                });
                it('does not replace the chain',() => {
                    expect(blockchain.chain).toEqual(originalChain);
                });
                it('logs an error',() => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the chain is valid',() => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });
                it('replaces the chain',() => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
                it('logs about chain replacement', ()=> {
                    expect(logMock).toHaveBeenCalled();
                })
            });
        });
    });
});