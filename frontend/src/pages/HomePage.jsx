import { useChatStore } from "../stores/chatStore";

import Sidebar from "../components/chat/Sidebar";
import NoChatSelected from "../components/chat/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import AIChatContainer from "../components/chat/AIChatContainer";

const HomePage = () => {
  const { selectedUser, isAIChatSelected } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] border border-base-300 overflow-hidden">
          <div className="flex h-full overflow-hidden">
            <Sidebar />

            {!selectedUser && !isAIChatSelected ? <NoChatSelected /> : isAIChatSelected ? <AIChatContainer /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
