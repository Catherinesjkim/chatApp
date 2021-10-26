// The Agora Web SDK is a JavaScript library loaded by an HTML web page. 
// The Agora Web SDK library uses APIs int he web browser to establish connections 
// and control the communication and live broadcast services.
// AgoraRTC is the entry point for all the methods that can be called in Agora Web SDK
// AgoraRTC provides the following methods: createClient, createStream, getDevices, getSupportedCodec, checkSystemRequirements

// 1. Use the createClient method to create a client object and get started.
// A Client object is a representation of a Local or Remote user in a call session, 
// and provides access to much of the core AgoraRTC functionality, see the table:
// https://docs.agora.io/en/Video/API%20Reference/web/index.html

// codec: algo used to encrypt the videos
let client = AgoraRTC.createClient({mode:'rtc', 'codec':"vp8"})

let config = {
    appid: 'ab164abd0feb4d13908da5f2c7327cd2', 
    token: '006ab164abd0feb4d13908da5f2c7327cd2IACqW8EXiTu7UYZQg/MGeeZ483XcSI+bnTdxg45kvweaEJDsq1EAAAAAEACcPzRR1Gx5YQEAAQDUbHlh',
    uid: null, 
    channel: 'videoConference',
}

// Create tracks: audio and/or video tracks
// my/main host's local client
let localTracks = {
    audioTracks: null,
    videoTracks: null,
}

// other users that joined a stream
let remoteTracks = {}


document.getElementById('join-btn').addEventListener('click', () => {
    console.log('User Joined stream')
})

let joinStreams = async () => {


    [config.uid, localTracks.audioTracks, localTracks] = await Promise.all([
        client.joined(config.appid, config.channel, config.token),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),

    ])


    let videoPlayer = `<div class="video-containers" id="video-wrapper-${config.uid}" >
                                <p class="user-uid">${config.uid}</p>
                                <div class="video-player player" id="stream-${config.uid}" ></div>
                       </div>`
}