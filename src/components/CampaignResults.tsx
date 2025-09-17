import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Search,
  Filter,
  BarChart3,
  MessageSquare
} from "lucide-react";

interface CampaignLog {
  [key: string]: any;
}

export function CampaignResults() {
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadCampaignData();
  }, []);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: logs, error: logsError } = await supabase
        .from('campaign_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setCampaignLogs(logs || []);

    } catch (error) {
      console.error('Failed to load campaign data:', error);
      toast({
        title: "Failed to Load Campaign Data",
        description: "Could not load campaign results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'opt_out':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredLogs = campaignLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesChannel = channelFilter === "all" || log.channel === channelFilter;
    
    return matchesSearch && matchesStatus && matchesChannel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient-primary mb-2">Campaign Results</h2>
        <p className="text-muted-foreground">Monitor your campaign performance and delivery statistics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Campaign Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="opt_out">Opted Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Campaign Logs</h3>
                <p className="text-muted-foreground text-sm">
                  Send campaigns to see results here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map(log => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.campaign_name}</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {log.channel === 'whatsapp' ? <Phone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                            {log.channel}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.recipient_phone || log.recipient_email} • {new Date(log.sent_at).toLocaleString()}
                        </div>
                        {log.error_message && (
                          <div className="text-sm text-red-600 mt-1">{log.error_message}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}