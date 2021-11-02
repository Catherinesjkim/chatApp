// The Agora Web SDK is a JavaScript library loaded by an HTML web page. 
// The Agora Web SDK library uses APIs int he web browser to establish connections 
// and control the communication and live broadcast services.
// AgoraRTC is the entry point for all the methods that can be called in Agora Web SDK
// AgoraRTC provides the following methods: createClient, createStream, getDevices, getSupportedCodec, checkSystemRequirements

// 1. Use the createClient method to create a client object and get started.
// A Client object is a representation of a Local or Remote user in a call session, 
// and provides access to much of the core AgoraRTC functionality, see the table:
// https://docs.agora.io/en/Video/API%20Reference/web/index.html

// #1 - codec: algo used to encrypt the videos - create client object.
let client = AgoraRTC.createClient({mode:'rtc', 'codec':"vp8"})

// #2 - Channel Name: videoConference
let config = {
    appid: 'ab164abd0feb4d13908da5f2c7327cd2', 
    token: '006ab164abd0feb4d13908da5f2c7327cd2IADjPkPuzGiCinPZMwak8xM8hYMJBaBrWhgWJszhmG89l5Dsq1EAAAAAEAC3nyPhif2CYQEAAQCJ/YJh',
    uid: null, 
    channel: 'videoConference',
}

// #3 - Setting tracks for when user joins
// Create tracks: audio and/or video tracks
// my/main host's local client
let localTracks = {
    audioTrack:null,
    videoTrack:null,
}

// #4 - Want to hold state for users audio and video so user can mute and hide
let localTrackState = {
    audioTrackMuted:false,
    videoTrackMuted:false
}

// #5 - Set remote tracks to store other users' obj.
// Other users that joined a stream - we need to store our subscribtion to other users when joined our stream
let remoteTracks = {}

// query selector .getElementById and listen for a click event. 
// On click output 'User Joined stream' on the console
document.getElementById('join-btn').addEventListener('click', async ()=> {
    console.log('A USER HAS JOINED OUR STREAM')
    await joinStreams()
})


document.getElementById('leave-btn').addEventListener('click', async () => {
    for(trackName in localTracks){
        let track = localTracks[trackName]
        if(track){
            // stops camera and mic
            track.stop()

            // disconnects from your camera and mic
            track.close()
            localTracks[trackName] = null
        }
    }

    // disconnect from their stream and let all remote users know that I left and remove our connection
    await client.leave()
})

// We need to wait for some network calls
// Method will take all my info and set user stream in frame
let joinStreams = async () => {

    // client event handler, listen for the user-published event from Agora.io
    // Event Handler working automatically
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    // #6 - Set our stream - connect our audio/video tracks here
    // Set and get back tracks for Local user
    // De-structuring the array here
    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
        client.join(config.appid, config.channel, config.token ||null, config.uid ||null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()

    ])

    // Create a videoPlayer to throw into the browser and add it to player list
    // An HTML element that we want to append to the DOM
    // id = it must unique
    let videoPlayer = `<div class="video-containers" id="video-wrapper-${config.uid}" >
                                <p class="user-uid" >${config.uid}</p>
                                <div class="video-player player" id="stream-${config.uid}" ></div>
                       </div>`

    // Connect to the DOM - which track to append to - don't use innerHtml per Agora.
    document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer)
    // Inside of our element, which video track append this to? So that other users can see our video. 
    // After appending this to the DOM on the browser. 
    localTracks.videoTrack.play(`stream-${config.uid}`)

    // #10 - Publish my local video tracks to entire channel so everyone can see it.
    await client.publish([localTracks.audioTrack, localTracks.videoTrack])

}


let handleUserLeft = async (user) => {
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`)
}


let handleUserJoined = async (user, mediaType) => {
    console.log('User has joined our stream')

    // #11 - Add user to list of remote users
    remoteTracks[user.uid] = user

    // #12 - Subscrive to remote users
    await client.subscribe(user, mediaType)


    if (mediaType === 'video'){
        // creating video player for a remote user
        let videoPlayer = `<div class="video-containers" id="video-wrapper-${user.uid}" >
                                <p class="user-uid" >${user.uid}</p>
                                <div class="video-player player" id="stream-${user.uid}" ></div>
                            </div>`
        // Connect to the DOM - which track to append to
        document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer)
        user.videoTrack.play(`stream-${user.uid}`)
    }
    
    if (mediaType === 'audio'){
        user.audioTrack.play()
    }

    
}