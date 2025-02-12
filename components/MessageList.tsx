import { Message } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  currentThinking: string;
  currentResponse: string;
  isThinkingComplete?: boolean;
}

export function MessageList({ messages, currentThinking, currentResponse, isThinkingComplete = false }: MessageListProps) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user' ? 'user-message' : 'message-bubble'}`}>
            <div className={message.role === 'user' ? 'text-white' : 'prose prose-invert max-w-none whitespace-pre-wrap'}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      
      {(currentThinking || currentResponse) && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg p-4 message-bubble">
            <div className="flex flex-col space-y-4">
              {currentThinking && (
                <div className="thinking-section border-b border-gray-700 pb-4">
                  <div className="text-sm text-foreground/80 mb-2">推理思考过程</div>
                  <div style={{ color: '#6a8d52' }} className="thinking-content whitespace-pre-wrap">
                    {currentThinking}
                  </div>
                </div>
              )}
              
              {currentResponse && (
                <div className="response-section">
                  <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 