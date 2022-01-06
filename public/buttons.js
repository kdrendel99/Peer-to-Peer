$( document ).ready(function() {

  $( "#toggleVideoButton" ).click(function() {
    $( "#myVideo" ).toggle()
    const myVideoFeed = document.getElementById("myVideo")
    videoGrid.append(myVideoFeed)
  });

  $( "#submit" ).click(function() {
    const destination = $( "#roomCode").val()
    window.location.replace(destination)
  });

  $( "#toggleAudioButton" ).click(function() {
    $('#toggleAudioButton').toggleClass('bi bi-volume-up bi bi-volume-mute')
    // let elements = document.querySelectorAll("video, audio, canvas");
    // let elemArr = Array.from(elements)
    // elemArr.filter(media => media.id !== 'myVideo').filter(media => media.id !== 'face').forEach( elem => {
    //   elem.muted = !elem.muted
    //   });
  });

  $( "#searchButton" ).click(function() {
    const currentRoom = window.location.href
    $( "#myRoomCode" ).append(currentRoom)
  });
});