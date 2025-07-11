import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Lock, Download, Trash2, Database, Shield, Users, CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { useTransactions } from "@/contexts/TransactionContext";

// Exchange rate API endpoint
const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";

// Add this utility function at the top of the file, outside the component
function applyDarkModeToAllPages() {
  // Apply dark mode to any global elements that need it
  const root = document.documentElement;
  const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Function to update all page styles
  const updateTheme = (isDark) => {
    if (isDark) {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '';
    }
  };
  
  // Get user preference from localStorage or use system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    updateTheme(true);
  } else if (savedTheme === 'system') {
    updateTheme(darkModeMedia.matches);
  } else {
    updateTheme(false);
  }
  
  // Listen for system preference changes
  darkModeMedia.addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'system') {
      updateTheme(e.matches);
    }
  });
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState([80]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportLoading, setExportLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [backupName, setBackupName] = useState("");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  const { departments } = useDepartments();
  const { transactions } = useTransactions();

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    toast({
      title: "Notifications Updated",
      description: `Notifications have been ${checked ? "enabled" : "disabled"}`,
      variant: "default",
    });
  };

  const handleThresholdChange = (value: number[]) => {
    setAlertThreshold(value);
    toast({
      title: "Alert Threshold Updated",
      description: `Alert threshold set to ${value[0]}%`,
      variant: "default",
    });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      // Here you would typically make an API call to change the password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      setPasswordError("");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
        variant: "default",
      });
    } catch (error) {
      setPasswordError("Failed to change password. Please try again.");
    }
  };

  const handleLogout = () => {
    // Here you would typically clear the auth token and redirect
    navigate("/login");
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      let content = "";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      switch (exportFormat) {
        case "csv":
          // Generate CSV content
          content = generateCSVContent();
          downloadFile(content, `export-${timestamp}.csv`, "text/csv");
          break;

        case "json":
          // Generate JSON content
          const jsonData = {
            departments,
            transactions,
            exportedAt: new Date().toISOString()
          };
          content = JSON.stringify(jsonData, null, 2);
          downloadFile(content, `export-${timestamp}.json`, "application/json");
          break;

        case "excel":
          // For Excel, we'll create a CSV with Excel MIME type
          content = generateCSVContent();
          downloadFile(content, `export-${timestamp}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          break;
      }

      toast({
        title: "Export Successful",
        description: `Your data has been exported in ${exportFormat.toUpperCase()} format`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
      setShowExportDialog(false);
    }
  };

  const generateCSVContent = () => {
    // Generate CSV headers
    const headers = [
      "Type",
      "ID",
      "Name",
      "Amount",
      "Date",
      "Description",
      "Department",
      "Status"
    ].join(",");

    // Generate department rows
    const departmentRows = departments.map(dept => [
      "Department",
      dept.id,
      dept.name,
      dept.budget,
      "",
      dept.description || "",
      dept.name,
      "Active"
    ].join(","));

    // Generate transaction rows
    const transactionRows = transactions.map(tx => [
      "Transaction",
      tx.id,
      tx.description,
      tx.amount,
      new Date(tx.date).toISOString(),
      tx.description,
      tx.department,
      tx.status
    ].join(","));

    // Combine all rows
    return [headers, ...departmentRows, ...transactionRows].join("\n");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    try {
      // Here you would typically make an API call to clear all data
      await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
        title: "Data Cleared",
        description: "All data has been cleared successfully",
        variant: "default",
        });
      setShowClearDataDialog(false);
    } catch (error) {
        toast({
          title: "Error",
        description: "Failed to clear data. Please try again.",
          variant: "destructive",
        });
      }
    };

  const handleBackupData = async () => {
    try {
      // Here you would typically make an API call to backup data
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Backup Created",
        description: `Backup "${backupName}" has been created successfully`,
        variant: "default",
      });
      setShowBackupDialog(false);
      setBackupName("");
    } catch (error) {
        toast({
        title: "Error",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically make an API call to invite a user
      await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
        title: "Invitation Sent",
        description: `Invitation has been sent to ${inviteEmail}`,
        variant: "default",
      });
      setShowInviteDialog(false);
      setInviteEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePayment = async () => {
    try {
      // Here you would typically make an API call to update payment method
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been updated successfully",
        variant: "default",
      });
      setShowPaymentDialog(false);
      setPaymentData({
        cardNumber: "",
        expiry: "",
        cvv: "",
        name: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full filter blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full filter blur-[80px] translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-emerald-500/30 rounded-full filter blur-[80px] translate-y-1/2" />
              </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-4xl font-black tracking-tight text-white mb-8" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          Settings
        </h1>
        
        <div className="grid gap-6">
          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                <Label className="text-white font-medium text-base" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>Enable Notifications</Label>
                  <p className="text-sm text-white/70">Receive alerts about budget updates</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationsChange}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              <div className="mt-6">
                <Label className="text-white font-medium text-base" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>Alert Threshold</Label>
                <p className="text-sm text-white/70 mb-2">Set the budget usage percentage that triggers alerts</p>
                <Slider
                  value={alertThreshold}
                  onValueChange={handleThresholdChange}
                  max={100}
                  step={1}
                  className="[&>span]:bg-emerald-500"
                />
                <p className="text-sm text-white/70 mt-2">{alertThreshold[0]}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                <Shield className="w-5 h-5" />
                Account Security
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              <Button
                variant="outline"
                  onClick={handleLogout}
                  className="border-white/20 text-white hover:bg-white/20 flex-1"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                <Users className="w-5 h-5" />
                Team Management
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">Manage team members and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowInviteDialog(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Invite Team Member
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">Manage your data and backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowExportDialog(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  onClick={() => setShowBackupDialog(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
              </div>
              <Button
                onClick={() => setShowClearDataDialog(true)}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">Manage your subscription and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPaymentDialog(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Change Password</DialogTitle>
              <DialogDescription className="text-white/70">
                Enter your current password and set a new password
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-white">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordModal(false)}
                className="border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordChange}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Change Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Export Data</DialogTitle>
              <DialogDescription className="text-white/70">
                Choose the format and export your data
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="exportFormat" className="text-white">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="csv" className="text-white hover:bg-white/10">CSV</SelectItem>
                    <SelectItem value="json" className="text-white hover:bg-white/10">JSON</SelectItem>
                    <SelectItem value="excel" className="text-white hover:bg-white/10">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowExportDialog(false)}
                className="border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={exportLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
              >
                {exportLoading ? "Exporting..." : "Export"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Data Dialog */}
        <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
          <AlertDialogContent className="bg-slate-900 border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Clear All Data</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                This action cannot be undone. This will permanently delete all your data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/20 text-white hover:bg-white/20">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearAllData}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Clear All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Backup Dialog */}
        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Create Backup</DialogTitle>
              <DialogDescription className="text-white/70">
                Enter a name for your backup
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="backupName" className="text-white">Backup Name</Label>
                <Input
                  id="backupName"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter backup name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowBackupDialog(false)}
                className="border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBackupData}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create Backup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite User Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Invite Team Member</DialogTitle>
              <DialogDescription className="text-white/70">
                Enter the email address of the person you want to invite
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="inviteEmail" className="text-white">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowInviteDialog(false)}
                className="border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleInviteUser}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Method Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Update Payment Method</DialogTitle>
              <DialogDescription className="text-white/70">
                Enter your new payment details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry" className="text-white">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={paymentData.expiry}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, expiry: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="MM/YY"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv" className="text-white">CVV</Label>
                <Input
                  id="cvv"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="123"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-white">Cardholder Name</Label>
                <Input
                  id="name"
                  value={paymentData.name}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)}
                className="border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePayment}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Update Payment Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    );
};

export default Settings;
