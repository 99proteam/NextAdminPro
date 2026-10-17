import type { Metadata } from "next";
import { chatChannels, chatMessages } from "@/lib/data";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = { title: "Chat" };

export default function ChatPage() {
  return <ChatView channels={chatChannels} messages={chatMessages} />;
}
