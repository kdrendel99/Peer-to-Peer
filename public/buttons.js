$( document ).ready(function() {

  $( "#toggleVideoButton" ).click(function() {
    $( "#myVideo" ).toggle()
  });

  $( "#submit" ).click(function() {
    const destination = $( "#roomCode").val()
    window.location.replace(destination)
  });

  $( "#toggleAudioButton" ).click(function() {
    console.log(myVideo.muted)
      myVideo.muted = true
      face.muted = true
  });


  $( "#muteAll" ).click(function() {
    // console.log(myVideo.muted)
    function muteMe(elem) {
      elem.muted = true;
    }

    document.querySelectorAll("video, audio").forEach( elem => muteMe(elem) );
  });

});