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

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)

    socket.emit('created user Id', userId)

    socket.on('disconnect', () => {
      console.log(userId, ' disconnected')
      io.sockets.emit('user-disconnected', userId)
    })
  })

  socket.on('connection-request', (roomId, userId) => {
    io.sockets.emit('new-user-connected', userId);
  })
})


const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`server is running on port ${port}.`));