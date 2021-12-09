//Referencing Socket. Were passing in the route path bc thats where our server is set up
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
//We have access to the peer library via line 10 in room.ejs. Since were connecting to our own server, we need to pass some paramaters to our new peer: The first paramater is going to be an id. undefined, because the server is going to take care of generating our own Id. Next, we pass our host, which is just the slash because its our root. Finally, our port is 3001.
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

const myVideo = document.createElement('video')
//other people still hear you, it just mutes the instant playback for yourself.
myVideo.muted = true


//a running list(technically an obj) of peers that connect to your room so you their videos are auto removed when they leave the call.
const peers = {}

//Get video and audio to send to other people. It includes a promise, that passes a stream (our video and audio). We want to tell our video object (we created in line ten in script.js) to use that stream. We do so with the function addVideoStream.
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log('1')
  addVideoStream(myVideo, stream)


  //This allows us to listen (RECEIVE calls) to when someone calls us on the myPeer obj. It answers their call, and sends them our current stream.
  myPeer.on('call', call => {
    call.answer(stream)
    console.log('2')
    //creates a new 'empty' video obj on your peer's screen for your stream
    const video = document.createElement('video')

//We answered the call, but now we need to give the other person OUR stream. userVideoStream is the OTHER users' video stream
    call.on('stream', userVideoStream => {
      console.log('3')
      addVideoStream(video, userVideoStream)
    })
  })

  //allows us to be connected to by other users. This is referencing line 34 in server.js, the following code is listening/waiting for 'user-connected' event (if a new user joins the room) it emits 'user-connected', and works as a trigger for the following function:
  socket.on('user-connected', userId => {
    console.log('4')
    //when a new user connects, were calling the function below. 
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  //closes our connection, but only if we have a connection to close
  if (peers[userId]) peers[userId].close()

  console.log('user disconnected' + userId)
})

//As soon as we connect with our peer server and get back an Id, we want to run the code that follows. It's gonna pass us the id of our user
myPeer.on('open', id => {
  console.log('5')
  //sends an event ('join-room') to our server. Passes in user Id whenever we actually join.
  socket.emit('join-room', ROOM_ID, id)
})


//HERE THROUGH LINE 65 ALLOWS US TO ACTUALLY MAKE THE CALL
// When a new user connects, this function is called and we're passing it our userId as well as our current video stream that we wanna send to the other user
function connectToNewUser(userId, stream){
  console.log('6')
  //Coming from our myPeer obj (line 5, script.js) and is calling a function called 'call'. The myPeer.call func is going to call a user (userId), and sending them our video and audio stream (stream). 
  const call = myPeer.call(userId, stream)

//Empty element that's waiting to add the other users' stream to it
  const video = document.createElement('video')
  //We wanna listen to for the event called 'stream'. When the other user(userId) sends us back THEIR video stream (userVideoStream), we're gonna get an event called 'stream' which takes in THEIR video stream.
  call.on('stream', userVideoStream => {
    console.log('7')
    //All 'userVideoStream' is doing is adding the other users' video stream (userVideoStream) to the new empty video element (video) on our page
    addVideoStream(video, userVideoStream)
  })
  //listen to on Close. on the close event, we remove the other person's video from our page, which empties 'video'.
  call.on('close', () => {
    video.remove()
  })

  //every user Id is equal and linked to a call that we make
  peers[userId] = call
}

//We wanna tell the video object to use our stream here. It takes the video, it plays the video as a stream, and once the stream/video is loaded on our page, we wanna play that video.
function addVideoStream(video, stream){
  console.log('8')
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}