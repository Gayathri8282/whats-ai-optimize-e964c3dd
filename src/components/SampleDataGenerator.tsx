import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Users, Zap, CheckCircle } from "lucide-react";

export function SampleDataGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();

  const handleGenerateSampleData = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sample-data');
      
      if (error) throw error;

      toast({
        title: "Success!",
        description: `Generated ${data.customers_created} sample customers with real iFood dataset structure`,
        variant: "default"
      });
      
      setIsGenerated(true);
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: "Error",
        description: "Failed to generate sample data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-card border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          iFood Dataset Sample Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          Generate realistic customer data based on iFood marketing campaign dataset
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Income, Age, Location
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Purchase Behavior
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Campaign Responses
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Real Analytics
            </Badge>
          </div>
        </div>

        <Button 
          onClick={handleGenerateSampleData} 
          disabled={isGenerating || isGenerated}
          className="w-full gap-2"
          variant={isGenerated ? "success" : "default"}
        >
          {isGenerating ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              Generating Sample Data...
            </>
          ) : isGenerated ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Sample Data Generated!
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Generate Sample Data
            </>
          )}
        </Button>
        
        {isGenerated && (
          <div className="text-xs text-center text-muted-foreground">
            Refresh the page to see your data-driven dashboard with real metrics!
          </div>
        )}
      </CardContent>
    </Card>
  );
}