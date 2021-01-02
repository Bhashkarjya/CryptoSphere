const PubNub = require('pubnub');

const credentials = {
    publishKey: 'pub-c-65a9b711-fb19-42e8-ab93-8c310d5deb78',
    subscribeKey: 'sub-c-c74df3d2-4948-11eb-a73a-1eec528e8f1f',
    secretKey: 'sec-c-NzA0YjAyMzEtNjBiZS00NzI5LThmZDUtNDFiOTNlZjg5NGVj'
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub{
    constructor({ blockchain }){
        this.blockchain = blockchain;
        this.pubnub = new PubNub(credentials);

        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
        this.pubnub.addListener(this.listener());
    }

    listener(){
        return {
            message: messageObject => {
                const {channel, message} = messageObject;
                console.log(`Message received. Channel: ${channel}. Message: ${message}`);

                const parsedMessage = JSON.parse(message);
                if(channel === CHANNELS.BLOCKCHAIN){
                    this.blockchain.replaceChain(parsedMessage);
                }
            }
        }
    }

    publish({ channel, message}){
        this.pubnub.publish({message, channel});
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }
}

module.exports = PubSub;
