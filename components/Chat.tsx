import { useState } from 'react';
import { ChatConfig } from '@/lib/types';
import { ConfigForm } from './ConfigForm';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';
import { Card } from './ui/card';

export function Chat() {
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const {
    messages,
    isLoading,
    error,
    currentThinking,
    currentResponse,
    isThinkingComplete,
    sendMessage
  } = useChat(config || { apiUrl: '', modelName: '', apiKey: '' });

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl flex flex-col gap-4">
        <div className="transition-all duration-500 ease-in-out origin-top">
          <ConfigForm onSubmit={setConfig} />
        </div>
        <Card className="flex-1 min-h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <MessageList
              messages={messages}
              currentThinking={currentThinking}
              currentResponse={currentResponse}
              isThinkingComplete={isThinkingComplete}
            />
          </div>
          {error && (
            <div className="p-4 text-red-500 text-center">
              {error}
            </div>
          )}
          <div className="border-t">
            <ChatInput 
              onSend={sendMessage} 
              isLoading={isLoading}
              disabled={!config} 
            />
          </div>
        </Card>
      </div>
    </div>
  );
} 