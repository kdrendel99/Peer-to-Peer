const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const preview = document.getElementById('preview')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

const myVideo = document.createElement('video')
myVideo.setAttribute('id', 'myVideo');
myVideo.muted = true
myVideo.style.display = "none";
// document.body.appendChild(vid);


$( document ).ready(function() {

  const default1 = document.getElementById("default") 
  const neutral = document.getElementById("neutral") 
  const happy = document.getElementById("happy") 
  const sad = document.getElementById("sad") 
  const angry = document.getElementById("angry") 
  const fearful = document.getElementById("fearful") 
  const disgusted = document.getElementById("disgusted") 
  const surprised = document.getElementById("surprised") 
  const nofaces = document.getElementById("nofaces") 
  
  let statusIconsArr = [
    default1,
    neutral,
    happy,
    sad,
    angry,
    fearful,
    disgusted,
    surprised,
    nofaces
  ]
  
  let statusIcons = {
    default: default1,
    neutral: neutral,
    happy: happy,
    sad: sad,
    angry: angry,
    fearful: fearful,
    disgusted: disgusted,
    surprised: surprised,
    nofaces: nofaces
  }
  
  const face = document.getElementById('face');
  var ctx = face.getContext("2d");
  
  //sets first face to random for testing purposes

    // const setInitialFace = (function() {
    //   var executed = false;
    //   return function() {
    //     if (!executed) {
    //       executed = true;
    //       let random = Math.floor((Math.random()*8))
    //       let img = statusIconsArr[random]
    //       drawImageScaled(img, ctx)
    //     }
    //   };
    // })();

    // setInitialFace();

  //end of random

  //sets first face to default

    const setInitialFace = (function() {
      var executed = false;
      return function() {
        if (!executed) {
          executed = true;
          let img = statusIcons.default
          drawImageScaled(img, ctx)
        }
      };
    })();

    setInitialFace();
  //end
  
  
  const peers = {}
  
  //ONLY ADD FACIAL TRACKING TO STREAM ONCE THESE ARE LOADED. USE A PROMISE TO ONLY IMPLEMENT THE FACIAL TRACKER ONCE THESE ARE LOADED
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ])
  // .then(startVideo)
  
  // function startVideo(){

    // console.log('1) startVideo')
    let stream = new MediaStream
    const emojiStream = face.captureStream(30)
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(videoStream => {
      // console.log('2) navigator.mediaDevices')
      let audioTrack = videoStream.getTracks().filter(function(track) {
        return track.kind === 'audio'
      })[0];
    
      emojiStream.addTrack( audioTrack );
      emojiStream.getTracks().forEach(function(track) {
        // console.log(track)
        if (track){
        //   console.log(track)
          stream.addTrack(track);
          // return track;
        }
      })
        console.log('STREAM:') 
        stream.getTracks().forEach(function(track) { if (track){ console.log(track)}})
        console.log('END STREAM TRACKS') 

        addVideoStream(myVideo, videoStream)  

        myPeer.on('call', call => {
          // console.log('3) myPeer.on "call"')
          call.answer(stream)
          const video = document.createElement('video')
          call.on('stream', userVideoStream => {
            // console.log('4) call.on "stream"')
            addVideoStream(video, userVideoStream)
          })
        })
      
        socket.on('user-connected', userId => {
          // console.log('5) socket.on "user-connected"')
          connectToNewUser(userId, stream)
        })
    })

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })
    
    myPeer.on('open', id => {
      // console.log('6) myPeer.on "open"')
      socket.emit('join-room', ROOM_ID, id)
    })
    
    function connectToNewUser(userId, stream) {
      // console.log('7) connect to new user')
      const call = myPeer.call(userId, stream)
      const video = document.createElement('video')
    
      call.on('stream', userVideoStream => {
        // console.log('8) call.on "stream"')
        addVideoStream(video, userVideoStream)
      })
      call.on('close', () => {
        video.remove()
      })
    
      peers[userId] = call
    }
    
    function addVideoStream(video, stream) {
      // console.log('9) addVideoStream')
      video.srcObject = stream
      video.addEventListener('loadedmetadata', () => {
        video.play()
        if (!video.id){
          let videoId = stream.id.slice(0,7)
          video.setAttribute('id', videoId)
        }
  
        let audioStream = new MediaStream()
        let audioTrack = (stream.getAudioTracks()[0])
          audioStream.addTrack(audioTrack)
          if (video.id === 'myVideo'){
            addSpeakingIndicator(audioStream, 'face')
          } else {
            addSpeakingIndicator(audioStream, video.id)
          }
      })
  
      videoGrid.append(video)
      // document.querySelectorAll("video, audio").forEach( elem => elem.muted = true );
    }

    function addSpeakingIndicator(audioStream, video){
      let speaker = document.getElementById(video)
      console.log('adding speaking indicator to: ', speaker)
  
      var options = {};
      var speechEvents = new hark(audioStream, options);
  
      speechEvents.on('speaking', function() {
        console.log('speaking');
      speaker.classList.add('active')
      });
  
      speechEvents.on('stopped_speaking', function() {
        console.log('stopped_speaking');
        speaker.classList.remove('active')
      });
    }














  
  function drawImageScaled(img, ctx) {
    face.width = img.width;
    face.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    setTimeout(() => drawImageScaled(img, ctx), 1000 / 30);
  }

  // myVideo.addEventListener('play', () => {
  //   setInterval(async () => {
  //     const detections = await faceapi.detectAllFaces(myVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
  //     if (detections.length > 0) {
  //       error.style.display = 'none'
  //       detections.forEach(element => {
  //         let status = "";
  //         let valueStatus = 0.0;
  //         for (const [key, value] of Object.entries(element.expressions)) {
  //           if (value > valueStatus) {
  //             status = key
  //             valueStatus = value;
  //           }
  //         }
  //         // highest scored expression (status) = display the right Emoji
  //         let img = statusIcons[status]
  //         drawImageScaled(img, ctx)
  //       });
  //     } else {
  //       let img = statusIcons.nofaces;
  //       drawImageScaled(img, ctx)
  //       error.style.display = 'block';
  //     }
  //   }, 100)
  // })
});

  

// audioStream.addTrack(vidStream.getAudioTracks()[0])
// stream.addTrack(vidStream.getAudioTracks()[0])
// addSpeakingIndicator(audioStream, face)
