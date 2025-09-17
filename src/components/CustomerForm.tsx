import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/hooks/useCustomers";
import { Loader2, Save, X } from "lucide-react";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: (customerData: Partial<Customer>) => Promise<void>;
}

interface CustomerFormData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  age: number;
  income: number;
  total_spent: number;
  total_purchases: number;
  campaigns_accepted: number;
  opt_out: boolean;
  complain: boolean;
  recency: number;
  mnt_wines: number;
  mnt_fruits: number;
  mnt_meat_products: number;
  mnt_gold_prods: number;
}

const LOCATIONS = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
  "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle"
];

const ENGAGEMENT_LEVELS = {
  "Low": 0,
  "Medium": 2,
  "High": 4
};

const SEGMENTS = {
  "New": { spending: 100, purchases: 1 },
  "Low Value": { spending: 300, purchases: 3 },
  "Medium Value": { spending: 750, purchases: 8 },
  "High Value": { spending: 1500, purchases: 15 }
};

export function CustomerForm({ isOpen, onClose, customer, onSave }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    age: 30,
    income: 50000,
    total_spent: 0,
    total_purchases: 0,
    campaigns_accepted: 0,
    opt_out: false,
    complain: false,
    recency: 30,
    mnt_wines: 0,
    mnt_fruits: 0,
    mnt_meat_products: 0,
    mnt_gold_prods: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        location: customer.location || "",
        age: customer.age || 30,
        income: customer.income || 50000,
        total_spent: customer.total_spent || 0,
        total_purchases: customer.total_purchases || 0,
        campaigns_accepted: customer.campaigns_accepted || 0,
        opt_out: (customer as any).opt_out || false,
        complain: customer.complain || false,
        recency: customer.recency || 30,
        mnt_wines: customer.mnt_wines || 0,
        mnt_fruits: customer.mnt_fruits || 0,
        mnt_meat_products: customer.mnt_meat_products || 0,
        mnt_gold_prods: customer.mnt_gold_prods || 0,
      });
    } else {
      // Reset form for new customer
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        age: 30,
        income: 50000,
        total_spent: 0,
        total_purchases: 0,
        campaigns_accepted: 0,
        opt_out: false,
        complain: false,
        recency: 30,
        mnt_wines: 0,
        mnt_fruits: 0,
        mnt_meat_products: 0,
        mnt_gold_prods: 0,
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    // Required fields
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Numeric validations
    if (formData.age < 18 || formData.age > 100) {
      newErrors.age = "Age must be between 18 and 100";
    }

    if (formData.income < 0) {
      newErrors.income = "Income cannot be negative";
    }

    if (formData.total_spent < 0) {
      newErrors.total_spent = "Total spent cannot be negative";
    }

    if (formData.total_purchases < 0) {
      newErrors.total_purchases = "Total purchases cannot be negative";
    }

    if (formData.campaigns_accepted < 0 || formData.campaigns_accepted > 5) {
      newErrors.campaigns_accepted = "Campaigns accepted must be between 0 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEngagementChange = (level: string) => {
    const campaignsAccepted = ENGAGEMENT_LEVELS[level as keyof typeof ENGAGEMENT_LEVELS];
    handleInputChange("campaigns_accepted", campaignsAccepted);
  };

  const handleSegmentChange = (segment: string) => {
    const segmentData = SEGMENTS[segment as keyof typeof SEGMENTS];
    if (segmentData) {
      handleInputChange("total_spent", segmentData.spending);
      handleInputChange("total_purchases", segmentData.purchases);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast({
        title: customer ? "Customer Updated" : "Customer Added",
        description: customer 
          ? `${formData.full_name} has been updated successfully`
          : `${formData.full_name} has been added successfully`,
      });
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save customer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentEngagement = () => {
    const campaigns = formData.campaigns_accepted;
    if (campaigns >= 4) return "High";
    if (campaigns >= 2) return "Medium";
    return "Low";
  };

  const getCurrentSegment = () => {
    const spending = formData.total_spent;
    if (spending >= 1000) return "High Value";
    if (spending >= 500) return "Medium Value";
    if (spending >= 200) return "Low Value";
    return "New";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter customer name"
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="customer@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {LOCATIONS.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                min="18"
                max="100"
                className={errors.age ? "border-red-500" : ""}
              />
              {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income"
                type="number"
                value={formData.income}
                onChange={(e) => handleInputChange("income", parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
                className={errors.income ? "border-red-500" : ""}
              />
              {errors.income && <p className="text-sm text-red-500">{errors.income}</p>}
            </div>
          </div>

          {/* Quick Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label>Customer Segment (Quick Setup)</Label>
              <Select onValueChange={handleSegmentChange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Current: ${getCurrentSegment()}`} />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {Object.keys(SEGMENTS).map(segment => (
                    <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Engagement Level (Quick Setup)</Label>
              <Select onValueChange={handleEngagementChange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Current: ${getCurrentEngagement()}`} />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {Object.keys(ENGAGEMENT_LEVELS).map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_spent">Total Spent ($)</Label>
              <Input
                id="total_spent"
                type="number"
                value={formData.total_spent}
                onChange={(e) => handleInputChange("total_spent", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={errors.total_spent ? "border-red-500" : ""}
              />
              {errors.total_spent && <p className="text-sm text-red-500">{errors.total_spent}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_purchases">Total Purchases</Label>
              <Input
                id="total_purchases"
                type="number"
                value={formData.total_purchases}
                onChange={(e) => handleInputChange("total_purchases", parseInt(e.target.value) || 0)}
                min="0"
                className={errors.total_purchases ? "border-red-500" : ""}
              />
              {errors.total_purchases && <p className="text-sm text-red-500">{errors.total_purchases}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaigns_accepted">Campaigns Accepted (0-5)</Label>
              <Input
                id="campaigns_accepted"
                type="number"
                value={formData.campaigns_accepted}
                onChange={(e) => handleInputChange("campaigns_accepted", parseInt(e.target.value) || 0)}
                min="0"
                max="5"
                className={errors.campaigns_accepted ? "border-red-500" : ""}
              />
              {errors.campaigns_accepted && <p className="text-sm text-red-500">{errors.campaigns_accepted}</p>}
            </div>
          </div>

          {/* Product Spending */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mnt_wines">Wines ($)</Label>
              <Input
                id="mnt_wines"
                type="number"
                value={formData.mnt_wines}
                onChange={(e) => handleInputChange("mnt_wines", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mnt_fruits">Fruits ($)</Label>
              <Input
                id="mnt_fruits"
                type="number"
                value={formData.mnt_fruits}
                onChange={(e) => handleInputChange("mnt_fruits", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mnt_meat_products">Meat ($)</Label>
              <Input
                id="mnt_meat_products"
                type="number"
                value={formData.mnt_meat_products}
                onChange={(e) => handleInputChange("mnt_meat_products", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mnt_gold_prods">Gold Products ($)</Label>
              <Input
                id="mnt_gold_prods"
                type="number"
                value={formData.mnt_gold_prods}
                onChange={(e) => handleInputChange("mnt_gold_prods", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recency">Recency (days since last purchase)</Label>
              <Input
                id="recency"
                type="number"
                value={formData.recency}
                onChange={(e) => handleInputChange("recency", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="opt_out"
                checked={formData.opt_out}
                onCheckedChange={(checked) => handleInputChange("opt_out", checked as boolean)}
              />
              <Label htmlFor="opt_out">Opted out of marketing</Label>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="complain"
                checked={formData.complain}
                onCheckedChange={(checked) => handleInputChange("complain", checked as boolean)}
              />
              <Label htmlFor="complain">Has complaints</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {customer ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}