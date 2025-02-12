import { Message } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentThinking: string;
  currentResponse: string;
}

export function MessageList({ messages, currentThinking, currentResponse }: MessageListProps) {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  
  // 当有新的思考内容时，默认折叠
  useEffect(() => {
    if (currentThinking) {
      setIsThinkingExpanded(false);
    }
  }, [currentThinking]);

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
        <div className="flex flex-col space-y-4">
          {currentThinking && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 message-bubble">
                <div className="thinking-section">
                  <div 
                    className="flex items-center cursor-pointer mb-2 hover:bg-gray-800 rounded p-1"
                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                  >
                    <span className="text-sm text-foreground/80">思考过程</span>
                    {isThinkingExpanded ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                  <div className={`transition-all duration-300 ${
                    isThinkingExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}>
                    <div style={{ color: '#6a8d52' }} className="thinking-content">
                      {currentThinking}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentResponse && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 message-bubble">
                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentResponse}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 