import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Key,
  Smartphone,
  Mail,
  Save,
  RefreshCw,
  Download,
  Upload,
  LogOut
} from "lucide-react";

export function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
      marketing: true,
    },
    appearance: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
    },
    privacy: {
      profileVisible: true,
      analyticsTracking: true,
      dataSharing: false,
    },
    integration: {
      whatsappApiKey: '',
      elevenLabsApiKey: '',
      openaiApiKey: '',
    }
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const dataToExport = {
        user: user,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-data-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
                  {user?.user_metadata?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold">{user?.user_metadata?.full_name || 'User Name'}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {user?.app_metadata?.provider || 'Email'} Account
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" defaultValue={user?.user_metadata?.full_name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Your company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="manager">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Marketing Manager</SelectItem>
                      <SelectItem value="analyst">Data Analyst</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="w-5 h-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Log out of your account to switch to a different account or end your session.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Updates</h4>
                    <p className="text-sm text-muted-foreground">Product updates and tips</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, marketing: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance & Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select defaultValue={settings.appearance.theme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue={settings.appearance.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue={settings.appearance.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST</SelectItem>
                      <SelectItem value="PST">PST</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-muted-foreground">Make your profile visible to team members</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.profileVisible}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisible: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Analytics Tracking</h4>
                    <p className="text-sm text-muted-foreground">Help improve the platform with usage analytics</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.analyticsTracking}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, analyticsTracking: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataSharing: checked }
                    }))}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>WhatsApp Business API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      placeholder="Enter your WhatsApp API key"
                      value={settings.integration.whatsappApiKey}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integration: { ...prev.integration, whatsappApiKey: e.target.value }
                      }))}
                    />
                    <Button variant="outline" size="sm">
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>ElevenLabs API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      placeholder="Enter your ElevenLabs API key"
                      value={settings.integration.elevenLabsApiKey}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integration: { ...prev.integration, elevenLabsApiKey: e.target.value }
                      }))}
                    />
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      placeholder="Enter your OpenAI API key"
                      value={settings.integration.openaiApiKey}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integration: { ...prev.integration, openaiApiKey: e.target.value }
                      }))}
                    />
                    <Button variant="outline" size="sm">
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4 border rounded-lg">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-success" />
                  <h4 className="font-medium">WhatsApp</h4>
                  <Badge variant="outline" className="bg-success/10 text-success">Connected</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-warning" />
                  <h4 className="font-medium">ElevenLabs</h4>
                  <Badge variant="outline" className="bg-warning/10 text-warning">Pending</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Key className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">OpenAI</h4>
                  <Badge variant="outline" className="bg-success/10 text-success">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}