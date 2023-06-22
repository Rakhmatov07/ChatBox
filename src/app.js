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
const botName = 'ChatBox';

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(process.cwd() + "/src/public"));
app.use(routers);

app.set("view engine", "ejs");
app.set("views", "src/views")

io.on('connection', async(socket) => {
    const users = await Users.read();
    socket.on('join', async({username, room}) => {
        // Welcome Message
        socket.emit('message', messageFormat(botName, `Welcome to Chatbox!`));
        const newUser = new userModel(socket.id, username, room);
        socket.join(newUser.room);
        console.log(newUser);
        const data = users.length ? [...users, newUser] : [newUser];
        await Users.write(data);

        // Join Message
        socket.broadcast.to(newUser.room).emit('message', messageFormat(botName, `${username} is joined to ${room} group.`));
    
        // room and users
        io.to(newUser.room).emit('roomUsers', {room: newUser.room, users});
    });
 
    socket.on('chatMessage', (text) => {
        const user = users.find((u) => u.id === socket.id);
        const msg = messageFormat(user.username, text);
        console.log(msg);
        io.to(user.room).emit('message', msg);
    })

    socket.on('disconnect', ()  => {
        const user = users.find(u => u.id === socket.id);
        const updatedUsers = users.filter(user => user.id !== socket.id);
        io.to(user.room).emit('message', messageFormat(botName, `${user.username} left the group`));
        
        // room and users
        io.to(user.room).emit('roomUsers', {room: user.room, users: updatedUsers});
    });

})

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} PORT.`);
})