require("dotenv").config()
//create express server
const express = require('express')
const app = express()
//create a server for socket io
const server = require('http').Server(app)
//(server) is the return
const io = require('socket.io')(server)
//renames the function from v4 to uuidV4
const { v4: uuidV4 } = require('uuid')

//set up express server so we have a route on the homepage
app.set('view engine', 'ejs')
//set up static folder. all js and css goes in public
app.use(express.static('public'))


//all we want is to create a brand new room and redirect the user to the room.
app.get('/',(req, res) => {
  res.redirect(`/${uuidV4()}`)
})

//create a route for our rooms
app.get('/:room', (req, res) => {
  res.render('room',{ roomId: req.params.room})
})

io.on('connection', socket => {
  //listening to event (when someone joins the room)
  socket.on('join-room', (roomId, userId) => {
    //this tells the users in the same room that we have a new user that just connected. we want the current socket to join a room. were joining this new room that we passed as an argument in 29 with the current user.
    socket.join(roomId)
    //now were going to send a message to the room were currently in. broadcast sends this message to everyone else in the room. The line directly below returns "Cannot read property 'emit' of undefined". So line 34 was fixed and pulled from the video comment section.
    // socket.to(roomId).broadcast.emit('user-connected', userId)
    // socket.on('ready', () => {
      socket.broadcast.to(roomId).emit('user-connected', userId)
    // })

//When OTHER user leaves, it's going to emit an event called 'user-disconnected' that we can reference to call a function in script.js (socket.io is going to call this when the other person leaves the call)
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })

    //were printing these things whenever a user joins the room
    console.log(roomId, userId)
  })
})

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`server is running on port ${port}.`));
// server.listen(3000)