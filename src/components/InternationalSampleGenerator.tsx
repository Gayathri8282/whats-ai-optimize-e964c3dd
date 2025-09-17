import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { Globe, Users, Zap, CheckCircle } from "lucide-react";

// Sample international customers for testing
const INTERNATIONAL_SAMPLE_CUSTOMERS = [
  {
    full_name: "Raj Patel",
    email: "raj.patel@gmail.com",
    phone: "+919876543210",
    country: "IN",
    city: "Mumbai",
    age: 34,
    income: 800000,
    total_spent: 1250,
    total_purchases: 12,
    campaigns_accepted: 3,
    complain: false,
    opt_out: false,
    recency: 15,
    mnt_wines: 0,
    mnt_fruits: 150,
    mnt_meat_products: 300,
    mnt_gold_prods: 800,
  },
  {
    full_name: "Emma Thompson",
    email: "emma.thompson@hotmail.co.uk",
    phone: "+447700900123",
    country: "GB",
    city: "London",
    age: 29,
    income: 45000,
    total_spent: 890,
    total_purchases: 8,
    campaigns_accepted: 4,
    complain: false,
    opt_out: false,
    recency: 7,
    mnt_wines: 200,
    mnt_fruits: 120,
    mnt_meat_products: 250,
    mnt_gold_prods: 320,
  },
  {
    full_name: "Hans Mueller",
    email: "hans.mueller@gmail.de",
    phone: "+4915123456789",
    country: "DE",
    city: "Berlin",
    age: 42,
    income: 55000,
    total_spent: 1650,
    total_purchases: 15,
    campaigns_accepted: 5,
    complain: false,
    opt_out: false,
    recency: 3,
    mnt_wines: 400,
    mnt_fruits: 180,
    mnt_meat_products: 600,
    mnt_gold_prods: 470,
  },
  {
    full_name: "Maria Silva",
    email: "maria.silva@hotmail.com",
    phone: "+5511987654321",
    country: "BR",
    city: "São Paulo",
    age: 31,
    income: 60000,
    total_spent: 750,
    total_purchases: 9,
    campaigns_accepted: 2,
    complain: true,
    opt_out: false,
    recency: 22,
    mnt_wines: 80,
    mnt_fruits: 200,
    mnt_meat_products: 300,
    mnt_gold_prods: 170,
  },
  {
    full_name: "Tanaka Hiroshi",
    email: "tanaka.hiroshi@yahoo.co.jp",
    phone: "+819012345678",
    country: "JP",
    city: "Tokyo",
    age: 38,
    income: 6500000,
    total_spent: 2100,
    total_purchases: 18,
    campaigns_accepted: 4,
    complain: false,
    opt_out: false,
    recency: 5,
    mnt_wines: 300,
    mnt_fruits: 150,
    mnt_meat_products: 800,
    mnt_gold_prods: 850,
  },
  {
    full_name: "Sophie Dubois",
    email: "sophie.dubois@orange.fr",
    phone: "+33612345678",
    country: "FR",
    city: "Paris",
    age: 27,
    income: 42000,
    total_spent: 680,
    total_purchases: 7,
    campaigns_accepted: 3,
    complain: false,
    opt_out: false,
    recency: 12,
    mnt_wines: 250,
    mnt_fruits: 100,
    mnt_meat_products: 180,
    mnt_gold_prods: 150,
  }
];

export function InternationalSampleGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const { addCustomer } = useCustomers();
  const { toast } = useToast();

  const handleGenerateInternationalSamples = async () => {
    setIsGenerating(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const customerData of INTERNATIONAL_SAMPLE_CUSTOMERS) {
        try {
          await addCustomer({
            ...customerData,
            location: `${customerData.city}, ${getCountryName(customerData.country)}`,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to add customer ${customerData.full_name}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "International Customers Added!",
        description: `Successfully added ${successCount} international customers${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
        variant: successCount > 0 ? "default" : "destructive"
      });
      
      if (successCount > 0) {
        setIsGenerated(true);
      }
    } catch (error) {
      console.error('Error generating international samples:', error);
      toast({
        title: "Error",
        description: "Failed to generate international sample customers",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCountryName = (code: string): string => {
    const countryNames: Record<string, string> = {
      'IN': 'India',
      'GB': 'United Kingdom', 
      'DE': 'Germany',
      'BR': 'Brazil',
      'JP': 'Japan',
      'FR': 'France'
    };
    return countryNames[code] || code;
  };

  return (
    <Card className="shadow-card border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          International Sample Customers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          Add sample customers from around the world to test international features
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">🇮🇳</span>
              Mumbai, India
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">🇬🇧</span>
              London, UK
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">🇩🇪</span>
              Berlin, Germany
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">🇧🇷</span>
              São Paulo, Brazil
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">🇯🇵</span>
              Tokyo, Japan
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">🇫🇷</span>
              Paris, France
            </Badge>
          </div>
        </div>

        <Button 
          onClick={handleGenerateInternationalSamples} 
          disabled={isGenerating || isGenerated}
          className="w-full gap-2"
          variant={isGenerated ? "secondary" : "default"}
        >
          {isGenerating ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              Adding International Customers...
            </>
          ) : isGenerated ? (
            <>
              <CheckCircle className="w-4 h-4" />
              International Customers Added!
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              Add International Sample Customers
            </>
          )}
        </Button>
        
        {isGenerated && (
          <div className="text-xs text-center text-muted-foreground">
            Check the Customers page to see your international customers with proper phone formats and locations!
          </div>
        )}
      </CardContent>
    </Card>
  );
}