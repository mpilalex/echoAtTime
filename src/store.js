const Redis = require("ioredis");
const logger = require("./logger").createLogger("Store");

class Store{

    constructor(id, config){
        this.id = id;
        this.redis = new Redis(config)
    }

    getItems(){
        return this.redis.lrange(this.id,0,-1);
    }

    sync(items){
        logger.info(`Syncing items: ${items}`);
        return new Promise(async (res, rej) => {
            const setListItem = async (index, val) => {
                const exists = await this.redis.lindex(this.id, index);
                if(null === exists){
                    await this.redis.lpush(this.id, val)
                } else {
                    await this.redis.lset(this.id, index, val)
                }
            };
            await this.clear();
            let i = 0;
            if(items.length){
                while (items.length){
                    try{
                        await setListItem(i, items.shift());
                        i++;
                    } catch (e) {
                        logger.error(`Sync error`, e);
                        rej(e);
                    }
                }
            }
            res();
            logger.info(`Syncing success`);

        })
    }

    async clear(){
        logger.info("Clear items");
        const exists = await this.getItems();
        await Promise.all(exists.map(item => {
            return this.redis.lrem(this.id, 1, item)
        }))
    }

}

module.exports = Store;

