// The Agora Web SDK is a JavaScript library loaded by an HTML web page. 
// The Agora Web SDK library uses APIs in the web browser to establish connections 
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
    token: '006ab164abd0feb4d13908da5f2c7327cd2IABYEtNs7rErqnjvGk7UwtvQ7CRfh+zhJhh85TKN05nlMpDsq1EAAAAAEAAGMGkoD/mgYQEAAQAP+aBh',
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

// query selector .getElementById and listen for a click event
// On click output 'User Joined stream' on the console
document.getElementById('join-btn').addEventListener('click', async ()=> {
    console.log('USER JOINED STREAM')
    await joinStreams()
})

// Adding mute/un-mute functionality to the mute button
document.getElementById('mic-btn').addEventListener('click', async () => {
    // Check if what the satte of muted currently is
    // Disable button
    if(!localTrackState.audioTrackMuted){
        // Mute your audio
        await localTracks.audioTrack.setMuted(true)
        localTrackState.audioTrackMuted = true
    } else {
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
    }
})

// Adding publish/un-publish video functionality to the mute button
document.getElementById('camera-btn').addEventListener('click', async () => {
    // Check if what the state of muted currently is
    // Disable button
    if(!localTrackState.videoTrackMuted){
        // Mute your audio
        await localTracks.videoTrack.setMuted(true);
        localTrackState.videoTrackMuted = true
    } else {
        await localTracks.videoTrack.setMuted(false)
        localTrackState.videoTrackMuted = false
    }
})

// When the local client (main host) leaves, removes it from the stream.
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
    document.getElementById('user-streams').innerHTML = ''
})


// We need to wait for some network calls
// Method will take all my info and set user stream in frame
let joinStreams = async () => {
    // Is this place hear strategically or can I add to end of method?

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

// When the remote user is leaving, it will remove the remote user and their video frame from our screen.
let handleUserLeft = async (user) => {
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`)
}

// if we unmuted it and does exist, then we want to add the video again.
// removing the dupe before adding it again. 
let handleUserJoined = async (user, mediaType) => {
    console.log('User has joined our stream')
    // #11 - Add user to list of remote users
    remoteTracks[user.uid] = user

    // #12 - Subscrive to remote users
    await client.subscribe(user, mediaType)

    let videoPlayer = document.getElementById(`video-wrapper-${user.uid}`)
    if(videoPlayer != null){
        videoPlayer.remove()
    }

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

// Unsubscribe from audio and video tracks
// Call AgoraRTCClient.unsubscribe to unsubscribe from the audio and video tracks of remote users.
// Subscribe to a specific user's audio and video
// await client.subscribe(user, "audio");
// await client.subscribe(user, "video");
// Unsubscribe from a specific user's video
// await client.unsubscribe(user, "video");
// Or unsubscribe from all the media tracks of a specific user
// await client.unsubscribe(user);
// Re: unsubscription:
// When a remote user unpublishes a track, the local user receives the user-unpublished callback.
// The SDK automatically releases the corresponding RemoteTrack object, and you do not need to call unsubscribe.

// This method is asynchronous and needs to be used with Promise or async/await.
// Use async methods when we have a lengthy operations. We usually need such an operation to complete in order
// to meaningfully continue program execution, but we don't want to "pause" until the operation completes
// (because pausing might mean e.g. that the UI stops responding, which is clearly undesirable).