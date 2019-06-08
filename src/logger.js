const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


exports.createLogger = function (clazz) {
    return createLogger({
        format: combine(
            label({ label: clazz }),
            timestamp(),
            myFormat
        ),
        transports: [new transports.Console()]
    })
};