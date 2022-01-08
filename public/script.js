const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  //hosted
  host:'default-realtime-server.herokuapp.com', 
  secure:true, 
  port:443
});

const peers = {}

const video = document.createElement('video')
video.setAttribute('id', 'myVideo');
video.setAttribute('autoplay', 'muted');
video.muted = true;
document.body.appendChild(video);
const myVideo = document.getElementById('myVideo')
myVideo.style.display = "none";

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

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
let img = statusIcons.default
drawImageScaled(img, ctx)

// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//   faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//   faceapi.nets.faceExpressionNet.loadFromUri('/models')
// ]).then(() => trackFaces())
  
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(videoStream => {
  let audioTrack = videoStream.getTracks().filter(function(track) {
    return track.kind === 'audio'
  })[0];

  const emojiStream = face.captureStream(30)
  emojiStream.addTrack( audioTrack );
  const stream = new MediaStream(emojiStream)

  addVideoStream(myVideo, videoStream)  

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')

    call.on('stream', userVideoStream => {
      console.log('incoming stream: ', stream)
      addVideoStream(video, userVideoStream)
    })
  })


  socket.on('new-user-connected',userId =>{
    if(userId!=myPeer.id){
      console.log("New user: "+userId);
      connectToNewUser(userId,stream);
    }
  })

  socket.emit('connection-request',ROOM_ID,myPeer.id);
})
.catch(function(err) {permissionDenied(err)})

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
  if (img !== undefined || ctx !== undefined || face !== undefined){
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    // setTimeout(() => drawImageScaled(img, ctx), 1000 / 20);
  }
}

function permissionDenied(err){
  console.log(err.name + ": " + err.message)
  $(".content").hide()
  $("#permissionDenied").modal({backdrop: 'static', keyboard: false}) 
  $(".content").hide()
}


// function trackFaces(){
//   setInterval(async () => {
//     const detections = await faceapi.detectSingleFace(myVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
//     if (detections !== undefined) {
//       error.style.opacity = '0%';
//       let status = "";
//       let valueStatus = 0.5;
//       for (const [key, value] of Object.entries(detections.expressions)) {
//         if (value > valueStatus) {
//           status = key
//           valueStatus = value;
//         }
//       }
//       // highest scored expression (status) = display the right Emoji
//       let img = statusIcons[status]
//       if (img !== undefined) drawImageScaled(img, ctx)
//     } else {
//       let img = statusIcons.nofaces;
//       drawImageScaled(img, ctx)
//       error.style.opacity = '100%';
//     }
//   }, 100)
// }