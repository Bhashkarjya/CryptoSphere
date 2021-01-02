const Block= require('./block');
const cryptoHash = require('../util/crypto-hash');

class Blockchain {
    constructor(){
        this.chain=[Block.genesis()];
    }

    addBlock({ data }){
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain){

        // if the new chain length is lesser than the original chain
        if(chain.length <= this.chain.length){
            console.error('The incoming chain must be longer');
            return;
        }

        //if the new chain is invalid
        if(!Blockchain.isValidChain(chain)){
            console.error('The incoming chain must be valid');
            return;
        }
        //The chain is replaced by the new chain
        console.log('The chain is replace by ', chain);
        this.chain=chain;
    }

    static isValidChain(chain){
        
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i=1;i<chain.length;i++)
        {
            const {timestamp, lastHash, hash, data, nonce, difficulty} =chain[i];
            const actualLastHash=chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            //checking if the lastHash value is correct
            if(lastHash !== actualLastHash ) return false;

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce,  difficulty);

            //checking if the hash produced is equal to the hash value of the block
            if(hash !== validatedHash) return false;
            if(Math.abs(lastDifficulty-difficulty) > 1) return false;
        }
        return true;
    }
}

module.exports=Blockchain;