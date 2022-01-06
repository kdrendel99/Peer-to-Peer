const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const video = document.createElement('video')
video.setAttribute('id', 'myVideo');
video.setAttribute('autoplay', 'muted');
video.muted = true;
document.body.appendChild(video);
const myVideo = document.getElementById('myVideo')
myVideo.style.display = "none";

const myPeer = new Peer(undefined, {
  //locally
  // host:'default-realtime-server.herokuapp.com', 
  // secure:true, 
  // port:443

  //hosted
  host:'default-realtime-server.herokuapp.com', 
  secure:true, 
  port:443
});

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

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
    const error = document.getElementById("error") 
    
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

  //Only add facial tracking to video once models are loaded.
  Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(() => trackFaces())

  let stream = new MediaStream
  const emojiStream = face.captureStream(30)
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(videoStream => {
    let audioTrack = videoStream.getTracks().filter(function(track) {
      return track.kind === 'audio'
    })[0];

    emojiStream.addTrack( audioTrack );
      emojiStream.getTracks().forEach(function(track) {
      if (track){
        stream.addTrack(track);
      }
    })

    addVideoStream(myVideo, videoStream)  

    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })
  })

  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })

  myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
  })

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')

    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })

    peers[userId] = call
  }

  function addVideoStream(video, stream) {
    video.srcObject = stream
    video.setAttribute("playsinline", true);
    video.addEventListener('loadedmetadata', () => {
      video.play()
      if (!video.id){
        let videoId = stream.id.slice(0,7)
        video.setAttribute('id', videoId)
        if($('#toggleAudioButton').hasClass('active')){
          video.muted = true;
        }
      }
    })
    videoGrid.append(video)
  }

  function drawImageScaled(img, ctx) {
    face.width = img.width;
    face.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    // setTimeout(() => drawImageScaled(img, ctx), 1000 / 30);
  }

  function trackFaces(){
    setInterval(async () => {
      const detections = await faceapi.detectSingleFace(myVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      if (detections !== undefined) {
        error.style.opacity = '0%';
          let status = "";
          let valueStatus = 0.5;
          for (const [key, value] of Object.entries(detections.expressions)) {
            if (value > valueStatus) {
              status = key
              valueStatus = value;
            }
          }
          // highest scored expression (status) = display the right Emoji
          let img = statusIcons[status]
          drawImageScaled(img, ctx)
      } else {
      let img = statusIcons.nofaces;
      drawImageScaled(img, ctx)
      error.style.opacity = '100%';
      }
    }, 100)
  }
});