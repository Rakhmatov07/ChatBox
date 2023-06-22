const moment = require("moment");
const { v4: uuid } = require("uuid");

const messageFormat = (username, text) => {
    return {
        id: uuid(),
        username: username,
        text: text,
        time: moment().format("h:mm a")
    }
}

module.exports = messageFormat;