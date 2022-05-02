import { useState, useCallback, useEffect, useContext, useRef } from "react";
import { SocketContext, SOCKET_EVENT } from "../service/socket"
import { makeMessage } from "../service/socket";
import MessageForm from "./MessageForm";



function ChatRoom({ nickname }) {

    const [messages, setMessages] = useState([]);
    const chatWindow = useRef(null);

    // socket 객체는 props를 통해 받지 않아도 미리 만들어놓았던 context로 사용할 수 있으므로 useContext를 사용
    const socket = useContext(SocketContext);



    // 채팅 메시지 목록 창 엘리먼트를 useRef를 이용해 참조하여, 새 메시지를 받을 때마다 스크롤을 이동하는 함수
    const moveScrollToReceiveMessage = useCallback(() => {

        if (chatWindow.current) {
            chatWindow.current.scrollTo({
                top: chatWindow.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, []);



    // RECEIVE_MESSAGE 이벤트 콜백: messages state에 데이터를 추가합니다.
    const handleReceiveMessage = useCallback(pongData => {

        // makeMessage : 서버가 던져준 데이터를 가지고 화면에 보여줄 텍스트를 가공하여 반환해주는 역할
        // 클라이언트가 raw data를 화면에 출력할 텍스트로 가공하는 역할을 부담하는 이유는 뷰단에서만 사용될 데이터의 단순 연산에 대한
        // 부담을 서버 컴퓨터가 갖지 않도록 하기 위해서
        const newMessage = makeMessage(pongData);
        setMessages(messages => [...messages, newMessage]);
        moveScrollToReceiveMessage();

    },

        [moveScrollToReceiveMessage]
    );


    useEffect(() => {
        // 컴포넌트가 마운트 될 때 설치하고
        socket.on(SOCKET_EVENT.RECEIVE_MESSAGE, handleReceiveMessage); // 이벤트 리스너 설치

        // 언마운트될 때 해제
        return () => {
            socket.off(SOCKET_EVENT.RECEIVE_MESSAGE, handleReceiveMessage); // 이벤트 리스너 해제
        };
    }, [socket, handleReceiveMessage]);



    return (
        <div
            className="d-flex flex-column"
            style={{ width: 1000 }}
        >
            <div className="text-box">
                <span>{nickname}</span> 님 환영합니다!
            </div>
            <div
                className="chat-window card"
                ref={chatWindow}
            >

                {messages.map((message, index) => {
                    const { nickname, content, time } = message;
                    // messages 배열을 map함수로 돌려 각 원소마다 item을 렌더링 해줍니다.
                    return (
                        <div key={index} className="d-flex flex-row">
                            {nickname && <div className="message-nickname">{nickname}: </div>}
                            <div>{content}</div>
                            <div className="time">{time}</div>
                        </div>
                    );
                })}
            </div>
            <MessageForm nickname={nickname} />
        </div>
    );
}

export default ChatRoom;