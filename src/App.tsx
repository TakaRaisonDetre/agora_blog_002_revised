

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
    console.log('role is', host)
    // function to initialise the SDK
         let init = async (channelName: string) => { 
        
          client.on("user-published", async (user, mediaType) => {
           
            await client.subscribe(user, mediaType);
            console.log("subscribe success");
            if (mediaType === "video") {
              setUsers((prevUsers) => {
                return [...prevUsers, user];
              });
              console.log('user list is ', users)
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


          };

    if (ready && tracks) {
      console.log("init ready");
     

      fetch(`https://us-central1-agore-node-express.cloudfunctions.net/app/access_token?channelName=${channelName}`)
      .then(function (response) {
         response.json().then(async function (data) {
           let token = data.token;
           console.log("Token to acquire", token)
           await client.join(appId, channelName, token, null);
           if (tracks && host===true) {
            await client.setClientRole("host");
            await client.publish([tracks[0], tracks[1]]);
           }
           else  {
            if(tracks && host===false){
              await client.setClientRole("audience");

              init(channelName);
             }
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

  console.log('users are', props.users)

  return (
   
    <div>
    <div id="videos">
    <AgoraVideoPlayer className='vid' videoTrack={props.tracks[1]}  style={{height: '65%', width: '65%'}} />
      {props.users.length > 0 &&
        props.users.map((user) => {
          if (user.videoTrack) {
            return (
             
              <AgoraVideoPlayer className='vid' videoTrack={user.videoTrack} key={user.uid}  style={{height: '25%', width: '25%'}} /> 
            );
          } else return null;
        })}
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