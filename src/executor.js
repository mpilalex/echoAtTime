const logger = require("./logger").createLogger("Executor");

class Executor{

    constructor(store){
        this.store = store;
        this.items = [];
        this.printedMessages = [];
    }

    async init(){
        const items = await this.store.getItems();
        logger.info(`Get from store: ${items}`);
        this.items = items.map(item => JSON.parse(item));
    }

    async execute(timestamp){
        const items = [];
        while (this.items.length){
            const item = this.items.shift();
            if(item.timestamp <= timestamp){
                if(this.printedMessages.indexOf(item.message) !== -1){
                    logger.warn(`Skipping message: ${item.message}`);
                } else {
                    logger.info(`----------  Printing message ------------`);
                    logger.info(item.message);
                    logger.info(`------------------------------------------`);
                    this.printedMessages.push(item.message);
                }
            } else {
                items.push(item);
            }
        }
        this.items = items;
        this.store.sync(items.map(item => JSON.stringify(item)));
    }

    push(timestamp, message){
        this.items.push({
            timestamp,
            message
        })
    }

}

module.exports = Executor;

