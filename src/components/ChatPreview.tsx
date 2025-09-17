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

  // Voice conversation state (simplified implementation)
  const [isVoiceActive, setIsVoiceActive] = useState(false);

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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Please log in to use the advanced chat features");
      }

      // Generate AI response using advanced chat
      const { data, error } = await supabase.functions.invoke('advanced-chat', {
        body: {
          message: userMessage,
          userId: user.id
        }
      });

      if (error) throw error;

      setTimeout(() => {
        const response = data?.response || "I'm here to help with your marketing needs!";
        addMessage(response, 'bot');
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
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setUseVoice(true);
      setIsVoiceActive(true);
      
      toast({
        title: "Voice Mode Activated",
        description: "Voice features will be available when ElevenLabs is configured",
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
    setIsVoiceActive(false);
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
          <p className="text-muted-foreground">Advanced AI assistant powered by your real marketing data and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* AI Assistant Features */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Advanced Marketing AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-card border">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Real-time Analytics</h4>
              <p className="text-xs text-muted-foreground">Uses your live campaign data</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <Bot className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Smart Insights</h4>
              <p className="text-xs text-muted-foreground">AI-powered recommendations</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Actionable Advice</h4>
              <p className="text-xs text-muted-foreground">Data-driven strategies</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Badge variant="secondary" className="bg-success/10 text-success">
              Connected to Your Data
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              GPT-4 Powered
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
                <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Advanced Marketing AI Assistant</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  I have access to your real customer data, campaign analytics, and ROI metrics. 
                  Ask me anything about your marketing performance!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="text-xs">Campaign Analysis</Badge>
                  <Badge variant="outline" className="text-xs">Customer Segmentation</Badge>
                  <Badge variant="outline" className="text-xs">ROI Optimization</Badge>
                  <Badge variant="outline" className="text-xs">Revenue Insights</Badge>
                </div>
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
          onClick={() => addMessage("Analyze my current campaign performance and suggest improvements", 'user')}
        >
          <MessageSquare className="w-6 h-6" />
          <span>Campaign Analysis</span>
        </Button>
        <Button
          variant="outline"
          className="p-4 h-auto flex-col gap-2"
          onClick={() => addMessage("Which customers should I target for my next high-value campaign?", 'user')}
        >
          <Zap className="w-6 h-6" />
          <span>Customer Targeting</span>
        </Button>
        <Button
          variant="outline"
          className="p-4 h-auto flex-col gap-2"
          onClick={() => addMessage("How can I improve my ROI based on current data?", 'user')}
        >
          <Bot className="w-6 h-6" />
          <span>ROI Optimization</span>
        </Button>
      </div>
    </div>
  );
}