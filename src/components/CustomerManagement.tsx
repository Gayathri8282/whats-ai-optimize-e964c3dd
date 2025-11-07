import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Search,
  Users,
  DollarSign,
  MessageSquare,
  Filter,
  Eye,
  Brain,
  TrendingUp,
  ShoppingCart,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Database
} from "lucide-react";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import { CustomerForm } from "@/components/CustomerForm";
import { InternationalSampleGenerator } from "@/components/InternationalSampleGenerator";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/utils/countries";
import { useCustomerCount } from "@/hooks/useCustomerCount";

export function CustomerManagement() {
  const { customers, segments, isLoading, findSimilarCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { count: totalCustomerCount } = useCustomerCount();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [similarCustomers, setSimilarCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showTestData, setShowTestData] = useState(true);
  const { toast } = useToast();

  // Separate real and test customers
  const realCustomers = customers.filter(c => !c.email.includes('@ifood.com'));
  const testCustomers = customers.filter(c => c.email.includes('@ifood.com'));

  const filteredRealCustomers = realCustomers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTestCustomers = testCustomers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    
    // Find similar customers using spending patterns
    try {
      const similar = await findSimilarCustomers(customer.id, 5);
      setSimilarCustomers(similar);
    } catch (error) {
      console.error('Error finding similar customers:', error);
    }
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, customerData);
    } else {
      await addCustomer(customerData);
    }
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
    } catch (error) {
      // Error handling is now managed by the hook
      console.error('Error deleting customer:', error);
    }
  };

  const handleAddNewCustomer = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const getCustomerSegment = (customer: Customer) => {
    if (customer.total_spent > 1000) return "High Value";
    if (customer.total_spent > 500) return "Medium Value";
    return "New/Low Value";
  };

  const getEngagementLevel = (customer: Customer) => {
    if (customer.campaigns_accepted >= 3) return "High";
    if (customer.campaigns_accepted >= 1) return "Medium";
    return "Low";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary flex items-center gap-2">
              <Users className="w-8 h-8" />
              Customer Management
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-success" />
              {realCustomers.length} real customers • {testCustomers.length} test customers
            </p>
          </div>
        <div className="flex gap-2">
          <Button onClick={handleAddNewCustomer} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add New Customer
          </Button>
          <Button variant="outline" size="lg">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Customer Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomerCount}</p>
                <p className="text-xs text-success">Real-time count</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        {segments.map((segment, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{segment.segment}</p>
                  <p className="text-2xl font-bold">{segment.count}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: ${(segment.avg_spending || 0).toFixed(0)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-success">
                    {(segment.engagement_rate || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* International Sample Generator */}
      {customers.length < 10 && (
        <div className="flex justify-center">
          <div className="max-w-md w-full">
            <InternationalSampleGenerator />
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Customer Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Real Customers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Real Customers ({realCustomers.length})</h3>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Purchases</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRealCustomers.slice(0, 10).map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.full_name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {customer.city && customer.country 
                        ? `${customer.city}, ${getCountryByCode(customer.country)?.name || customer.country}`
                        : customer.location}
                    </TableCell>
                    <TableCell className="font-medium">${(customer.total_spent || 0).toFixed(2)}</TableCell>
                    <TableCell>{customer.total_purchases}</TableCell>
                    <TableCell>
                      <Badge variant={getEngagementLevel(customer) === 'High' ? 'default' : 
                                   getEngagementLevel(customer) === 'Medium' ? 'secondary' : 'outline'}>
                        {getEngagementLevel(customer)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCustomerSegment(customer)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Customer Profile: {customer.full_name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedCustomer && (
                              <div className="space-y-6">
                                {/* Customer Details */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Contact Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Email:</strong> {selectedCustomer.email}</p>
                                        <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                                        <p><strong>Location:</strong> {selectedCustomer.location}</p>
                                        <p><strong>Age:</strong> {selectedCustomer.age}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Financial Profile</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Income:</strong> ${selectedCustomer.income?.toLocaleString()}</p>
                                         <p><strong>Total Spent:</strong> ${(selectedCustomer.total_spent || 0).toFixed(2)}</p>
                                        <p><strong>Recency:</strong> {selectedCustomer.recency} days</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Purchase Behavior</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Wines:</strong> ${selectedCustomer.mnt_wines?.toFixed(2)}</p>
                                        <p><strong>Fruits:</strong> ${selectedCustomer.mnt_fruits?.toFixed(2)}</p>
                                        <p><strong>Meat:</strong> ${selectedCustomer.mnt_meat_products?.toFixed(2)}</p>
                                        <p><strong>Gold:</strong> ${selectedCustomer.mnt_gold_prods?.toFixed(2)}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Campaign Engagement</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Campaigns Accepted:</strong> {selectedCustomer.campaigns_accepted}/5</p>
                                        <p><strong>Total Purchases:</strong> {selectedCustomer.total_purchases}</p>
                                        <p><strong>Complaints:</strong> {selectedCustomer.complain ? 'Yes' : 'No'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Similar Customers */}
                                {similarCustomers.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                      <Brain className="w-4 h-4" />
                                      Similar Customers (AI Analysis)
                                    </h4>
                                    <div className="space-y-2">
                                      {similarCustomers.slice(0, 3).map((similar) => (
                                        <div key={similar.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                           <div className="text-sm">
                                             <span className="font-medium">{similar.full_name}</span>
                                             <span className="text-muted-foreground ml-2">${(similar.total_spent || 0).toFixed(2)}</span>
                                           </div>
                                          <Badge variant="outline" className="text-xs">
                                            {getCustomerSegment(similar)}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex gap-2">
                                  <Button variant="default" className="flex-1">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Send Campaign
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    View Analytics
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Delete Customer">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {customer.full_name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredRealCustomers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No real customers found. Add customers or adjust your search.</p>
                </div>
              )}
            </div>

            {/* Test Data Section */}
            {testCustomers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-orange-600">Test Data ({testCustomers.length})</h3>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Seeded Data
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTestData(!showTestData)}
                  >
                    {showTestData ? 'Hide' : 'Show'} Test Data
                  </Button>
                </div>
                
                {showTestData && (
                  <div className="rounded-md border border-orange-200 bg-orange-50/20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Total Spent</TableHead>
                          <TableHead>Purchases</TableHead>
                          <TableHead>Engagement</TableHead>
                          <TableHead>Segment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTestCustomers.slice(0, 10).map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{customer.full_name}</div>
                                <div className="text-sm text-muted-foreground">{customer.email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {customer.city && customer.country 
                                ? `${customer.city}, ${getCountryByCode(customer.country)?.name || customer.country}`
                                : customer.location}
                            </TableCell>
                            <TableCell className="font-medium">${(customer.total_spent || 0).toFixed(2)}</TableCell>
                            <TableCell>{customer.total_purchases}</TableCell>
                            <TableCell>
                              <Badge variant={getEngagementLevel(customer) === 'High' ? 'default' : 
                                           getEngagementLevel(customer) === 'Medium' ? 'secondary' : 'outline'}>
                                {getEngagementLevel(customer)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getCustomerSegment(customer)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleViewCustomer(customer)}
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Customer Profile: {customer.full_name}
                                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                                          Test Data
                                        </Badge>
                                      </DialogTitle>
                                    </DialogHeader>
                                    {selectedCustomer && (
                                      <div className="space-y-6">
                                        {/* Customer Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-4">
                                            <div>
                                              <h4 className="font-semibold mb-2">Contact Information</h4>
                                              <div className="space-y-1 text-sm">
                                                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                                                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                                                <p><strong>Location:</strong> {selectedCustomer.location}</p>
                                                <p><strong>Age:</strong> {selectedCustomer.age}</p>
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <h4 className="font-semibold mb-2">Financial Profile</h4>
                                              <div className="space-y-1 text-sm">
                                                <p><strong>Income:</strong> ${selectedCustomer.income?.toLocaleString()}</p>
                                                <p><strong>Total Spent:</strong> ${(selectedCustomer.total_spent || 0).toFixed(2)}</p>
                                                <p><strong>Recency:</strong> {selectedCustomer.recency} days</p>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-4">
                                            <div>
                                              <h4 className="font-semibold mb-2">Purchase Behavior</h4>
                                              <div className="space-y-1 text-sm">
                                                <p><strong>Wines:</strong> ${selectedCustomer.mnt_wines?.toFixed(2)}</p>
                                                <p><strong>Fruits:</strong> ${selectedCustomer.mnt_fruits?.toFixed(2)}</p>
                                                <p><strong>Meat:</strong> ${selectedCustomer.mnt_meat_products?.toFixed(2)}</p>
                                                <p><strong>Gold:</strong> ${selectedCustomer.mnt_gold_prods?.toFixed(2)}</p>
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <h4 className="font-semibold mb-2">Campaign Engagement</h4>
                                              <div className="space-y-1 text-sm">
                                                <p><strong>Campaigns Accepted:</strong> {selectedCustomer.campaigns_accepted}/5</p>
                                                <p><strong>Total Purchases:</strong> {selectedCustomer.total_purchases}</p>
                                                <p><strong>Complaints:</strong> {selectedCustomer.complain ? 'Yes' : 'No'}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                          <Button variant="default" className="flex-1">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Send Campaign
                                          </Button>
                                          <Button variant="outline" className="flex-1">
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            View Analytics
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditCustomer(customer)}
                                  title="Edit Customer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" title="Delete Customer">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Test Customer</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {customer.full_name}? This test customer will be removed permanently.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}