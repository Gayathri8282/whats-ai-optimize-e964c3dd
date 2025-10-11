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
  Send,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Bot,
  User,
  Copy,
  RefreshCw,
  Trash2
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'audio';
  metrics?: {
    customers?: number;
    revenue?: number;
    roi?: number;
  };
}

const AUTO_GREETINGS = [
  "Hi there! 👋 I'm your AI marketing assistant with access to your real-time business data. What would you like to know?",
  "Hello! I can analyze your campaigns, customer segments, and ROI. How can I help optimize your marketing today?",
  "Welcome! I have insights from your customer data and campaign metrics. Ask me anything about your marketing performance!",
  "Hey! I'm connected to your live analytics. Want to explore campaign performance, customer insights, or revenue optimization?",
  "Greetings! Your AI assistant here with access to all your marketing data. What aspect should we dive into today?"
];

export function ChatPreview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsConnected(!!user);
      } catch (error) {
        console.error('Connection check error:', error);
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, sender: 'user' | 'bot', metrics?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      type: 'text',
      metrics
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage("");
    addMessage(userMessage, 'user');

    // First message - send auto greeting
    if (!conversationStarted) {
      setConversationStarted(true);
      const greeting = AUTO_GREETINGS[Math.floor(Math.random() * AUTO_GREETINGS.length)];
      setTimeout(() => {
        addMessage(greeting, 'bot');
      }, 400);
      return;
    }

    // Subsequent messages - call AI backend
    setIsTyping(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Guest mode fallback
        setIsTyping(false);
        addMessage(
          "For the best experience with full analytics access, please sign in. I can still help with general marketing questions in guest mode!",
          'bot'
        );
        return;
      }

      const { data, error } = await supabase.functions.invoke('advanced-chat', {
        body: {
          message: userMessage,
          userId: user.id
        }
      });

      if (error) {
        console.error('Chat error:', error);
        throw error;
      }

      // Extract metrics if available
      const metrics = data?.context?.metrics;
      if (metrics && !userMetrics) {
        setUserMetrics(metrics);
      }

      setTimeout(() => {
        const response = data?.response || "I'm here to help with your marketing needs! Could you provide more details?";
        addMessage(response, 'bot', metrics);
        setIsTyping(false);
      }, 700);

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      addMessage(
        "I'm experiencing technical difficulties connecting to the AI service. Please try again in a moment.",
        'bot'
      );
      toast({
        title: "Connection Error",
        description: "Unable to reach AI service. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const clearChat = () => {
    setMessages([]);
    setConversationStarted(false);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset",
    });
  };

  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (!lastUserMessage) return;

    // Remove last bot message
    setMessages(prev => prev.slice(0, -1));
    
    // Resend last user message
    setInputMessage(lastUserMessage.content);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            AI Marketing Assistant
          </h1>
          <p className="text-muted-foreground">Powered by Groq Llama 3.1 with real-time access to your business data</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            {isConnected ? 'Connected' : 'Guest Mode'}
          </Badge>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Live Metrics Dashboard */}
      {userMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="text-xl font-bold">{userMetrics.customers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold">${userMetrics.revenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className="text-xl font-bold">{userMetrics.roi?.toFixed(1) || '0'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Insights</p>
                  <p className="text-xl font-bold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Capabilities */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What I Can Do For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-primary/20 hover:border-primary/40 transition-colors">
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-1">Campaign Analytics</h4>
              <p className="text-xs text-muted-foreground">Analyze performance, ROI, and engagement metrics in real-time</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-success/20 hover:border-success/40 transition-colors">
              <Users className="w-8 h-8 text-success mb-2" />
              <h4 className="font-semibold text-sm mb-1">Customer Intelligence</h4>
              <p className="text-xs text-muted-foreground">Segment audiences and identify high-value customer patterns</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-warning/20 hover:border-warning/40 transition-colors">
              <TrendingUp className="w-8 h-8 text-warning mb-2" />
              <h4 className="font-semibold text-sm mb-1">Growth Strategies</h4>
              <p className="text-xs text-muted-foreground">Get AI-powered recommendations to boost revenue and engagement</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              Groq Llama 3.1 70B
            </Badge>
            <Badge variant="secondary" className="bg-success/10 text-success">
              Real-time Data Access
            </Badge>
            <Badge variant="secondary" className="bg-warning/10 text-warning">
              Context-Aware Insights
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="shadow-card">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Marketing AI Assistant
                  {isConnected && <Sparkles className="w-4 h-4 text-primary" />}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-warning' : 'bg-success'} animate-pulse`} />
                  <span className="text-sm text-muted-foreground">
                    {isTyping ? "Analyzing..." : isConnected ? "Ready with live data" : "Ready (Guest Mode)"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={regenerateResponse} disabled={isTyping}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <Sparkles className="w-3 h-3 mr-1" />
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {message.sender === 'bot' && (
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted border border-border rounded-lg p-3">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-2 text-xs text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="border-t p-4 bg-muted/20">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me about campaigns, customers, ROI, or growth strategies..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isTyping ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {!isConnected && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                💡 Sign in for full analytics access and personalized insights
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Start Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => handleQuickAction("Analyze my current campaign performance and suggest improvements")}
              disabled={isTyping}
            >
              <BarChart3 className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Campaign Analysis</span>
              <span className="text-xs text-muted-foreground">Performance review</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex-col gap-2 hover:border-success hover:bg-success/5 transition-all"
              onClick={() => handleQuickAction("Which customers should I target for my next high-value campaign?")}
              disabled={isTyping}
            >
              <Users className="w-6 h-6 text-success" />
              <span className="text-sm font-medium">Customer Targeting</span>
              <span className="text-xs text-muted-foreground">Segment insights</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex-col gap-2 hover:border-warning hover:bg-warning/5 transition-all"
              onClick={() => handleQuickAction("How can I improve my ROI based on current data?")}
              disabled={isTyping}
            >
              <TrendingUp className="w-6 h-6 text-warning" />
              <span className="text-sm font-medium">ROI Optimization</span>
              <span className="text-xs text-muted-foreground">Growth strategies</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex-col gap-2 hover:border-secondary hover:bg-secondary/5 transition-all"
              onClick={() => handleQuickAction("What are the key insights from my customer data?")}
              disabled={isTyping}
            >
              <Sparkles className="w-6 h-6 text-secondary" />
              <span className="text-sm font-medium">Data Insights</span>
              <span className="text-xs text-muted-foreground">Key metrics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}