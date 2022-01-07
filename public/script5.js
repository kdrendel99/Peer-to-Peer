navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(videoStream => {
  let audioTrack = videoStream.getTracks().filter(function(track) {
    return track.kind === 'audio'
  })[0];
  let stream = face.captureStream(30)
  stream.addTrack( audioTrack );

  addVideoStream(myVideo, videoStream)  

  myPeer.on('call', call => {
    console.log('this peer is being called. stream to send = ' + typeof stream)
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log('incoming stream: ' + stream)
      addVideoStream(video, userVideoStream)
    })
  })
  socket.emit("ready")

  socket.on('user-connected', userId => {
    console.log("New user connected..."+ stream)
    stream.getTracks().forEach(function(track) {
        if (track){
          console.log(track)
        }
      })
    connectToNewUser(userId, stream)
  })
})