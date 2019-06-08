const Store = require("./store");
const Executor = require("./executor");
const Cron = require("./cron");
const {createLogger} = require("./logger");
const fastify = require("fastify")();
const logger = createLogger("Server");
const moment = require("moment");



exports.start = function (id) {

    const store = new Store(id);
    const executor = new Executor(store);
    const cron = new Cron(1000, executor.execute.bind(executor));

    fastify.route({
        method: "GET",
        url: "/echoAtTime",
        handler: function (request, reply) {
            const {time, message}  = request.query;
            if(!time || !message){
                reply.code(500).send({
                    success: false,
                    errorMessage: "Please provide time and message params"
                });
                return;
            }
            const timestamp = moment(time).valueOf();
            if(isNaN(timestamp)){
                reply.code(500).send({
                    success: false,
                    errorMessage: "Invalid time format"
                });
                return;
            }
            if(timestamp < moment().valueOf()){
                reply.code(500).send({
                    success: false,
                    errorMessage: "Time is in the past"
                });
                return;
            }
            const [epoch] = String(timestamp/1000).split(".");
            executor.push(epoch, message);
            reply.send({success: true});
        }
    });



    fastify.listen(3000, async (err, address) => {
        if (err) {
            logger.error(err);
            process.exit(1)
        }
        logger.info(`server listening on ${address}`);
        await executor.init();
        cron.start();

    })
};