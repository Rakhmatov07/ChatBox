require("dotenv/config");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const routers = require("./routes");
const io = require("socket.io")(server, {cors: {origin: "*"}});
const PORT = process.env.PORT || 1207;
const IO = require("./utils/io");
const Users = new IO("./database/users.json");
const userModel = require("./models/user");
const messageFormat = require("./models/message");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(process.cwd() + "/src/public"));
app.use(routers);

app.set("view engine", "ejs");
app.set("views", "src/views")

io.on('connection', async(socket) => {
    socket.emit('message', `Welcome to Chatbox!`);
    const users = await Users.read();
    socket.on('join', async({username, room}) => {
        socket.broadcast.emit('message', `${username} is joined to ${room} group.`);
        const newUser = new userModel(socket.id, username, room);
        socket.join(newUser.room);
        console.log(newUser);
        const data = users.length ? [...users, newUser] : [newUser];
        await Users.write(data);
    });
 
    socket.on('chatMessage', (text) => {
        const user = users.find((u) => u.id === socket.id);
        const msg = messageFormat(user.username, text);
        console.log(msg);
        io.emit('message', msg);
    })

    socket.on('disconnect', ()  => {
        io.emit('message', 'User left the group');
    });

})

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} PORT.`);
})