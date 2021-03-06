const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash=require('../util/crypto-hash');
const hexToBinary=require('hex-to-binary');

class Block{
    constructor({timestamp,lastHash,hash,data,nonce,difficulty}){
        this.timestamp=timestamp;
        this.data=data;
        this.hash=hash;
        this.lastHash=lastHash;
        this.nonce=nonce;
        this.difficulty=difficulty;
    }

    //This is an example of a factory method.In this method,we return a new instance of a class.
    //This function will create a new instance for anyone who is calling it.
    static genesis(){
        return new this(GENESIS_DATA);
    }

    static mineBlock({lastBlock,data}) {
        // const timestamp=Date.now();
        const lastHash=lastBlock.hash;
        let {difficulty} = lastBlock;
        let hash,timestamp;
        let nonce = 0;
        
        do{
            nonce++;
            timestamp=Date.now();
            difficulty=Block.adjustDifficulty({originalBlock: lastBlock, timestamp});
            hash=cryptoHash(timestamp,lastHash,data,nonce,difficulty);
        }
        while(hexToBinary(hash).substring(0,difficulty) !== '0'.repeat(difficulty));
        
        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
            //hash: cryptoHash(timestamp,lastHash,data,nonce,difficulty)
        });
    }

    static adjustDifficulty({ originalBlock, timestamp}){
        const {difficulty} = originalBlock;
        if(difficulty < 1) return 1;
        const difference = timestamp - originalBlock.timestamp;
        if( difference > MINE_RATE) return (difficulty-1);
        return difficulty+1;
    }


}

module.exports=Block;