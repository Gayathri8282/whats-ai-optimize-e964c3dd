import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Settings,
  Zap,
  Bot,
  User
} from "lucide-react";
import { useConversation } from "@11labs/react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'audio';
}

export function ChatPreview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useVoice, setUseVoice] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [agentId, setAgentId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // ElevenLabs Voice Conversation
  const conversation = useConversation({
    onConnect: () => {
      toast({
        title: "Voice Connected",
        description: "Voice conversation is now active",
      });
    },
    onDisconnect: () => {
      toast({
        title: "Voice Disconnected", 
        description: "Voice conversation ended",
      });
    },
    onMessage: (message) => {
      if (message.type === 'user_transcript' && message.message) {
        addMessage(message.message, 'user');
      } else if (message.type === 'agent_response' && message.message) {
        addMessage(message.message, 'bot');
      }
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage("");
    addMessage(userMessage, 'user');
    setIsTyping(true);

    try {
      // Generate AI response using OpenAI
      const { data, error } = await supabase.functions.invoke('generate-campaign', {
        body: {
          prompt: `You are a helpful WhatsApp marketing assistant. User said: "${userMessage}". Provide a helpful, conversational response about marketing, campaigns, or customer engagement. Keep it under 150 words.`,
          context: "WhatsApp Marketing Assistant"
        }
      });

      if (error) throw error;

      setTimeout(() => {
        addMessage(data.response || "I'm here to help with your marketing needs!", 'bot');
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Chat error:', error);
      addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceConversation = async () => {
    try {
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please enter your ElevenLabs API key first",
          variant: "destructive"
        });
        return;
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // For demo purposes, we'll simulate voice conversation
      setUseVoice(true);
      toast({
        title: "Voice Mode Activated",
        description: "Speak naturally to interact with the AI assistant",
      });
      
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features",
        variant: "destructive"
      });
    }
  };

  const stopVoiceConversation = () => {
    setUseVoice(false);
    toast({
      title: "Voice Mode Deactivated",
      description: "Switched back to text mode",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            AI Chat Preview
          </h1>
          <p className="text-muted-foreground">Interactive WhatsApp marketing assistant with voice capabilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Voice Setup Card */}
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            ElevenLabs Voice Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">ElevenLabs API Key</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Agent ID (Optional)</label>
              <Input
                placeholder="agent_..."
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={useVoice ? stopVoiceConversation : startVoiceConversation}
              variant={useVoice ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {useVoice ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              {useVoice ? "End Voice Chat" : "Start Voice Chat"}
            </Button>
            <Badge variant={useVoice ? "default" : "outline"}>
              {useVoice ? "Voice Active" : "Text Mode"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="shadow-card">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Marketing Assistant</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    {isTyping ? "Typing..." : "Online"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {useVoice && (
                <Button variant="ghost" size="sm">
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
              <Badge variant="outline" className="bg-success/10 text-success">
                AI Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Welcome to AI Marketing Assistant</h3>
                <p className="text-muted-foreground text-sm">
                  Ask me about campaigns, customer engagement, or marketing strategies!
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder={useVoice ? "Voice mode active - speak to chat" : "Type your message..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={useVoice || isTyping}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || useVoice || isTyping}
              >
                Send
              </Button>
            </div>
            {useVoice && (
              <div className="mt-2 text-center">
                <Badge variant="default" className="animate-pulse">
                  <Mic className="w-3 h-3 mr-1" />
                  Listening...
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="p-4 h-auto flex-col gap-2"
          onClick={() => addMessage("How can I improve my campaign performance?", 'user')}
        >
          <MessageSquare className="w-6 h-6" />
          <span>Ask about campaigns</span>
        </Button>
        <Button
          variant="outline"
          className="p-4 h-auto flex-col gap-2"
          onClick={() => addMessage("What's the best time to send WhatsApp messages?", 'user')}
        >
          <Zap className="w-6 h-6" />
          <span>Timing advice</span>
        </Button>
        <Button
          variant="outline"
          className="p-4 h-auto flex-col gap-2"
          onClick={() => addMessage("Help me segment my customers better", 'user')}
        >
          <Bot className="w-6 h-6" />
          <span>Customer insights</span>
        </Button>
      </div>
    </div>
  );
}