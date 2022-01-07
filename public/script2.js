var id_peer="thePeerIDSomeoneElseSentUs";

// Create own peer object with connection to shared PeerJS server
//this ID doesn't get used
peer = new Peer();

//HAVE to wait for connection to be opened before we try passing through our stream.  Was needed for Safari!
peer.on('open', function (id) {

    //request our media stream with the constraints defined above
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {

        //save for ourselves so we can mute or end the stream later
        stream_self=stream;

        //make the call with the id we've been sent
        //if a video call, we're already viewing our own stream so no need to re-view it
        //we pass our media stream through to the call
        peer_call = peer.call(id_peer,stream_self);

        //when the call is answered we'll be passed back the other person's stream
        peer_call.on('stream', (remoteStream) => {


            stream_remote=remoteStream;

            //your code for playing the remote stream
        });

        peer_call.on('close',call_end);

        peer_call.on('error', function(err) { 
            console.log(err);
        });

    })
    .catch(function(err) {
        console.log(err);
    });        

});

peer.on('close', call_end);
peer.on('error', function (err) {
    console.log(err);
});