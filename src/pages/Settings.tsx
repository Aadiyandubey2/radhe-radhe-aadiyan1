import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Building2, Phone, Mail } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

  return (
    <AppLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input placeholder="Your name" /></div>
              <div><Label>Phone</Label><Input placeholder="+91 9876543210" /></div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Company Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Company Name</Label><Input placeholder="Your Transport Co." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>GST Number</Label><Input placeholder="GSTIN" /></div>
              <div><Label>PAN Number</Label><Input placeholder="PAN" /></div>
            </div>
            <div><Label>Business Address</Label><Input placeholder="Full address" /></div>
            <Button>Update Company Info</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
