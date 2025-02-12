import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChatConfig } from '@/lib/types';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface ConfigFormProps {
  onSubmit: (config: ChatConfig) => void;
}

const defaultProviders = [
  { label: 'CyberMugglesG&R', value: 'cybermuggles' },
  { label: '自定义', value: 'custom' }
];

const defaultApiUrls = [
  { label: 'http://124.222.75.42:4120', value: 'http://124.222.75.42:4120' },
  { label: '自定义', value: 'custom' }
];

const defaultModels = [
  { label: 'GeminiMIXR1', value: 'GeminiMIXR1' },
  { label: '自定义', value: 'custom' }
];

export function ConfigForm({ onSubmit }: ConfigFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({
    apiUrl: defaultApiUrls[0].value,
    modelName: defaultModels[0].value,
    apiKey: ''
  });
  const [customProvider, setCustomProvider] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(defaultProviders[0].value);
  const [selectedApiUrl, setSelectedApiUrl] = useState(defaultApiUrls[0].value);
  const [selectedModel, setSelectedModel] = useState(defaultModels[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalConfig = {
      apiUrl: selectedApiUrl === 'custom' ? customApiUrl : selectedApiUrl,
      modelName: selectedModel === 'custom' ? customModel : selectedModel,
      apiKey: config.apiKey
    };
    setIsConfigured(true);
    setIsExpanded(false);
    onSubmit(finalConfig);
    // 聚焦到聊天输入框
    const chatInput = document.querySelector<HTMLTextAreaElement>('.chat-input');
    if (chatInput) {
      chatInput.focus();
    }
  };

  return (
    <Card className="w-full bg-zinc-900 text-white border-zinc-800 focus:ring-zinc-700">
      <CardHeader 
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-white">配置聊天 {isConfigured && '(已配置)'}</CardTitle>
        {isExpanded ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
      </CardHeader>
      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
          isExpanded ? 'max-h-[1000px]' : 'max-h-0'
        }`}
      >
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">服务供应商</label>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                disabled={isConfigured}
                className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-700"
              >
                {defaultProviders.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </Select>
              {selectedProvider === 'custom' && (
                <Input
                  value={customProvider}
                  onChange={(e) => setCustomProvider(e.target.value)}
                  placeholder="输入自定义服务供应商"
                  className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-zinc-700"
                  disabled={isConfigured}
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">API URL</label>
              <Select
                value={selectedApiUrl}
                onChange={(e) => setSelectedApiUrl(e.target.value)}
                disabled={isConfigured}
                className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-700"
              >
                {defaultApiUrls.map(url => (
                  <option key={url.value} value={url.value}>
                    {url.label}
                  </option>
                ))}
              </Select>
              {selectedApiUrl === 'custom' && (
                <Input
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="输入自定义API URL"
                  className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-zinc-700"
                  disabled={isConfigured}
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">模型名称</label>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isConfigured}
                className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-700"
              >
                {defaultModels.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </Select>
              {selectedModel === 'custom' && (
                <Input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="输入自定义模型名称"
                  className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-zinc-700"
                  disabled={isConfigured}
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">API Key</label>
              <div className="relative">
                <Input
                  required
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="输入API Key"
                  className="pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-zinc-700"
                  style={{ WebkitTextSecurity: showApiKey ? 'none' : 'disc' } as React.CSSProperties}
                  autoComplete="new-password"
                  disabled={isConfigured}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className={`w-full bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600 focus:ring-zinc-700 ${isConfigured ? 'opacity-50' : ''}`}
              disabled={isConfigured}
            >
              {isConfigured ? '已配置' : '开始聊天'}
            </Button>
          </form>
        </CardContent>
      </div>
    </Card>
  );
} 