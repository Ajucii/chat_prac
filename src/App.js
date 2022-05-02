import { useCallback, useEffect, useRef, useState } from "react";
import { socket, SocketContext, SOCKET_EVENT } from "../src/service/socket";
import ChatRoom from "./components/ChatRoom";
import NicknameForm from "./components/NicknameForm";




function App() {

  // 리렌더링을 하지 않게 하기 위해 state가 아닌 useRef로 관리
  const prevNickname = useRef(null);

  const [nickname, setNickname] = useState("연준짱");


  useEffect(() => {

    return () => {
      socket.disconnect();
    }
  }, []);


  useEffect(() => {

    if (prevNickname.current) {
      // 서버에 이전 닉네임과 바뀐 닉네임을 전송
      socket.emit(SOCKET_EVENT.UPDATE_NICKNAME, {
        prevNickname: prevNickname.current,
        nickname,
      });
    } else {
      socket.emit(SOCKET_EVENT.JOIN_ROOM, { nickname });
    }

  }, [nickname]);

  const handleSubmitNickname = useCallback(newNickname => {
    prevNickname.current = nickname;
    setNickname(newNickname);
  }, [nickname]
  );




  return (
    <SocketContext.Provider value={socket}>
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <NicknameForm handleSubmitNickname={handleSubmitNickname} />
        <ChatRoom nickname={nickname} />
      </div>
    </SocketContext.Provider>
  );
}


export default App;