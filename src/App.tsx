// // Migration Agora Web SDK to Agora Web SDK NG
// //https://agoraio-community.github.io/AgoraWebSDK-NG/docs/en/migration_guide 
// //This guide helps developers who have implemented the Agora Web SDK in their apps to migrate from the Agora Web SDK to the Agora Web SDK NG.

// import React, { useEffect, useState } from "react";
// // React wrapper components or Higher order components as they are often called are a pattern that developers have created for reusing component logic that emerges from React’s compositional nature.
// import {
//   ClientConfig,
//   IAgoraRTCRemoteUser,
//   ICameraVideoTrack,
//   IMicrophoneAudioTrack,
// } from "agora-rtc-sdk-ng";

// import {
//   AgoraVideoPlayer,
//   createClient,
//   createMicrophoneAndCameraTracks,
// } from "agora-rtc-react";

// //You need to configure it when calling the createClient method to create a web client.The mode and codec properties are required.
// const config: ClientConfig = { 
//   mode: "rtc", codec: "vp8",
// };


// const appId: string = '6bb4e5cc2ba04652b76ba36a4b7b5ce6';
// const token: string | null = null;

// const App = () => {
//   const [inCall, setInCall] = useState(false);
//   const [channelName, setChannelName] = useState("");
//   return (<div>
//       <h1 className="heading">Agora RTC NG SDK React Wrapper With Token Authentication</h1>
//       {inCall ? (
//         <VideoCall setInCall={setInCall} channelName={channelName} />
//       ) : (
//         <ChannelForm setInCall={setInCall} setChannelName={setChannelName} />
//       )}
//     </div>
    
//   );
// };

// // the create methods in the wrapper return a hook
// // the create method should be called outside the parent component
// // this hook can be used the get the client/stream in any component

// //Call createClient to create an AgoraRTCClient object, which represents a local user in a voice or video communication or live broadcast. The AgoraRTCClient interface provides the major functions for a voice or video communication or live broadcast.
// const useClient = createClient(config);

// //Creates an audio track and a video track.
// //https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/interfaces/iagorartc.html#createmicrophoneandcameratracks
// //Creates an audio track from the audio sampled by a microphone and a video track from the video captured by a camera.
// //Calling this method differs from calling createMicrophoneAudioTrack and createCameraVideoTrack separately:
// //This method call requires access to the microphone and the camera at the same time. In this case, users only need to do authorization once
// //Calling createMicrophoneAudioTrack and createCameraVideoTrack requires access to the microphone and the camera separately. In this case, users need to do authorization twice.
// const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

// const VideoCall = (props: {
//   setInCall: React.Dispatch<React.SetStateAction<boolean>>;
//   channelName: string;
// }) => {
//   const { setInCall, channelName } = props;
//   const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
//   const [start, setStart] = useState<boolean>(false);

//   // using the hook to get access to the client object
//   const client = useClient();
//   // ready is a state variable, which returns true when the local tracks are initialized, untill then tracks variable is null
//   const { ready, tracks } = useMicrophoneAndCameraTracks();

//   useEffect(() => {
//     // function to initialise the SDK
//     let init = async (name: string) => {
//       //The Client interface provides major functions for a voice/video call, such as joining a channel and publishing a stream.
//       //client.on - The SDK triggers this callback when the local client successfully subscribes to a remote stream and decodes the first audio frame.
//       client.on("user-published", async (user, mediaType) => {
//         //This method enables a user to subscribe to a remote stream.
//         // This method can be called multiple times for a single remote stream, and enables you to switch between receiving/not receiving the video or audio data flexibly.
//         await client.subscribe(user, mediaType);

//         console.log("subscribe success");
//         if (mediaType === "video") {
//           setUsers((prevUsers) => {
//             return [...prevUsers, user];
//           });
//         }
//         if (mediaType === "audio") {
//           user.audioTrack?.play();
//         }
//       });

//       client.on("user-unpublished", (user, type) => {
//         console.log("unpublished", user, type);
//         if (type === "audio") {
//           user.audioTrack?.stop();
//         }
//         if (type === "video") {
//           setUsers((prevUsers) => {
//             return prevUsers.filter((User) => User.uid !== user.uid);
//           });
//         }
//       });

//       client.on("user-left", (user) => {
//         console.log("leaving", user);
//         setUsers((prevUsers) => {
//           return prevUsers.filter((User) => User.uid !== user.uid);
//         });
//       });


//       // await client.join(appId, name, token, null);
//       // if (tracks) await client.publish([tracks[0], tracks[1]]);
//       // setStart(true);

//     };

//     if (ready && tracks) {
//       console.log("init ready");
//       fetch(`https://us-central1-agore-node-express.cloudfunctions.net/app/access_token?channelName=${channelName}`)
//         .then(function (response) {
//           response.json().then(async function (data) {
//             let token = data.token;
//             console.log("Error to acquire", token)
//             await client.join(appId, channelName, token, null);
//             if (tracks) await client.publish([tracks[0], tracks[1]]);
//             setStart(true);
//           })

//         })

//       init(channelName)
//     }

//   }, [channelName, client, ready, tracks]);


//   return (
//     <div className="App">
//       {ready && tracks && (
//         <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} />
//       )}
//       {start && tracks && <Videos users={users} tracks={tracks} />}
//     </div>
//   );
// };

// const Videos = (props: {
//   users: IAgoraRTCRemoteUser[];
//   tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
// }) => {
//   const { users, tracks } = props;

//   return (
//     <div>
//       <div id="videos">
//         {/* AgoraVideoPlayer component takes in the video track to render the stream,
//             you can pass in other props that get passed to the rendered div */}
//         <AgoraVideoPlayer style={{ height: '95%', width: '95%' }} className='vid' videoTrack={tracks[1]} />
//         {users.length > 0 &&
//           users.map((user) => {
//             if (user.videoTrack) {
//               return (
//                 <AgoraVideoPlayer style={{ height: '95%', width: '95%' }} className='vid' videoTrack={user.videoTrack} key={user.uid} />
//               );
//             } else return null;
//           })}
//       </div>
//     </div>
//   );
// };

// export const Controls = (props: {
//   tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
//   setStart: React.Dispatch<React.SetStateAction<boolean>>;
//   setInCall: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const client = useClient();
//   const { tracks, setStart, setInCall } = props;
//   const [trackState, setTrackState] = useState({ video: true, audio: true });

//   const mute = async (type: "audio" | "video") => {
//     if (type === "audio") {
//       await tracks[0].setEnabled(!trackState.audio);
//       setTrackState((ps) => {
//         return { ...ps, audio: !ps.audio };
//       });
//     } else if (type === "video") {
//       await tracks[1].setEnabled(!trackState.video);
//       setTrackState((ps) => {
//         return { ...ps, video: !ps.video };
//       });
//     }
//   };

//   const leaveChannel = async () => {
//     await client.leave();
//     client.removeAllListeners();
//     // we close the tracks to perform cleanup
//     tracks[0].close();
//     tracks[1].close();
//     setStart(false);
//     setInCall(false);
//   };

//   return (
//     <div className="controls">
//       <p className={trackState.audio ? "on" : ""}
//         onClick={() => mute("audio")}>
//         {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
//       </p>
//       <p className={trackState.video ? "on" : ""}
//         onClick={() => mute("video")}>
//         {trackState.video ? "MuteVideo" : "UnmuteVideo"}
//       </p>
//       {<p onClick={() => leaveChannel()}>Leave</p>}
//     </div>
//   );
// };

// const ChannelForm = (props: {
//   setInCall: React.Dispatch<React.SetStateAction<boolean>>;
//   setChannelName: React.Dispatch<React.SetStateAction<string>>;
// }) => {
//   const { setInCall, setChannelName } = props;

//   return (
//     <form className="join">
//       {appId === '' && <p style={{ color: 'red' }}>Please enter your Agora App ID in App.tsx and refresh the page</p>}
//       <input type="text"
//         placeholder="Enter Channel Name"
//         onChange={(e) => setChannelName(e.target.value)}
//       />
//       <button onClick={(e) => {
//         e.preventDefault();
//         setInCall(true);
//       }}>
//         Join
//       </button>
//     </form>
//   );
// };

// export default App;


import React, { useEffect, useState } from "react";
import {
  AgoraVideoPlayer,
  createClient,
  createMicrophoneAndCameraTracks,
  ClientConfig,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-react";


const config: ClientConfig = { 
  mode: "live", codec: "vp8",
};

const appId: string = "6bb4e5cc2ba04652b76ba36a4b7b5ce6"; //ENTER APP ID HERE


const App = () => {
  const [inCall, setInCall] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [host, setHost] = useState<boolean>(false)
  return (
    <div>
      <h1 className="heading">Agora RTC NG SDK React Wrapper</h1>
      {inCall ? (
        <VideoCall setInCall={setInCall} channelName={channelName}  host={host}/>
      ) : (
        <ChannelForm setInCall={setInCall} setChannelName={setChannelName}  setHost={setHost}/>
      )}
    </div>
  );
};

// the create methods in the wrapper return a hook
// the create method should be called outside the parent component
// this hook can be used the get the client/stream in any component
const useClient = createClient(config);
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const VideoCall = (props: {
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
  host: boolean;
  channelName: string;
}) => {
  const { setInCall, channelName } = props;
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [start, setStart] = useState<boolean>(false);
  const {host} =props

  // using the hook to get access to the client object
  const client = useClient();
  // ready is a state variable, which returns true when the local tracks are initialized, untill then tracks variable is null
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  useEffect(() => {
    // function to initialise the SDK
    let init = async (name: string) => {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        console.log("subscribe success");
        if (mediaType === "video") {
          setUsers((prevUsers) => {
            return [...prevUsers, user];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user, type) => {
        console.log("unpublished", user, type);
        if (type === "audio") {
          user.audioTrack?.stop();
        }
        if (type === "video") {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        }
      });

      client.on("user-left", (user) => {
        console.log("leaving", user);
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });

      // await client.join(appId, name, token, null);
      // if (tracks) await client.publish([tracks[0], tracks[1]]);
      // setStart(true);

    };

    if (ready && tracks) {
      console.log("init ready");
      init(channelName);
      
 
      fetch(`https://us-central1-agore-node-express.cloudfunctions.net/app/access_token?channelName=${channelName}`)
              .then(function (response) {
                 response.json().then(async function (data) {
                   let token = data.token;
                   console.log("Error to acquire", token)
                   await client.join(appId, channelName, token, null);
                   if (tracks && host===true) {
                    await client.setClientRole("host");
                    await client.publish([tracks[0], tracks[1]]);
                  }
                 
                 
                   setStart(true);
                 })
      
               })
    }

  }, [channelName, client, ready, tracks]);


  return (
    <div className="App">
      {ready && tracks && (
        <Controls tracks={tracks} setStart={setStart} setInCall={setInCall}/>
      )}
      {start && tracks && <Videos users={users} tracks={tracks} host={host}/>}
    </div>
  );
};

const Videos = (props: {
  users: IAgoraRTCRemoteUser[];
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
  host: boolean;
}) => {
  const { users, tracks, host } = props;

  return (
    <div>
      <div id="videos">
        {/* AgoraVideoPlayer component takes in the video track to render the stream,
            you can pass in other props that get passed to the rendered div */}

           <AgoraVideoPlayer style={{height: '55%', width: '55%'}} className='vid' videoTrack={tracks[1]} />
      
        {/* {users.length > 0 &&
          users.map((user) => {
            if (user.videoTrack) {
              return (
                <AgoraVideoPlayer style={{height: '95%', width: '95%'}} className='vid' videoTrack={user.videoTrack} key={user.uid} />
              );
            } else return null;
          })} */}
      </div>
    </div>
  );
};


export const Controls = (props: {
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
  setStart: React.Dispatch<React.SetStateAction<boolean>>;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const client = useClient();
  const { tracks, setStart, setInCall } = props;
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  const mute = async (type: "audio" | "video") => {
    if (type === "audio") {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === "video") {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    // we close the tracks to perform cleanup
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);
  };

  return (
    <div className="controls">
      <p className={trackState.audio ? "on" : ""}
        onClick={() => mute("audio")}>
        {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
      </p>
      <p className={trackState.video ? "on" : ""}
        onClick={() => mute("video")}>
        {trackState.video ? "MuteVideo" : "UnmuteVideo"}
      </p>
      {<p onClick={() => leaveChannel()}>Leave</p>}
    </div>
  );
};

const ChannelForm = (props: {
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
  setChannelName: React.Dispatch<React.SetStateAction<string>>;
  setHost: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { setInCall, setChannelName, setHost } = props;

  return (
    <form className="join">
      {appId === '' && <p style={{color: 'red'}}>Please enter your Agora App ID in App.tsx and refresh the page</p>}
      <input type="text"
        placeholder="Enter Channel Name"
        onChange={(e) => setChannelName(e.target.value)}
      />
      <button onClick={(e) => {
        e.preventDefault();
        setInCall(true);
        setHost(true);
      }}>
        Join as Host
      </button>
      <button onClick={(e) => {
        e.preventDefault();
       setInCall(true);
        setHost(false);
      }}>
        Join as Audience
      </button>
    </form>
  );
};

export default App;