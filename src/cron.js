const logger = require("./logger").createLogger("Cron");

class Cron {

    constructor(timeout = 1000, executor){
        if(typeof executor !== "function"){
            throw new Error(`Executor must be a function`);
        }
        this.timeout = timeout;
        this.intervalId = null;
        this.executor = executor;
    }

    start(){
        if(this.intervalId){
            logger.warn(`Cron already started`);
            return false;
        }
        this.intervalId = setInterval(async () => {
            //logger.info(`Running cron executor`);
            try{
                await this.executor(Date.now()/1000);
                //logger.info('Executed successfully');
            } catch (e) {
                logger.error('Got an error while executing task', e);
            }
        }, this.timeout);
        logger.info(`Cron run with interval: ${this.timeout}`);
        return true;
    }

    stop(){
        if(null === this.intervalId){
            logger.warn(`Cron task already stopped`);
            return false;
        }
        clearInterval(this.intervalId);
        this.intervalId = null;
        logger.info(`Cron stopped`);
        return true;
    }

}


module.exports = Cron;