import { AppLayout } from "@/components/layout/AppLayout";
import { useDrivers, useCreateDriver, useDeleteDriver } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Phone, Trash2, IdCard } from "lucide-react";
import { useState } from "react";

export default function Drivers() {
  const { data: drivers, isLoading } = useDrivers();
  const { data: vehicles } = useVehicles();
  const createDriver = useCreateDriver();
  const deleteDriver = useDeleteDriver();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createDriver.mutateAsync({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string || null,
      license_number: formData.get("license_number") as string || null,
      license_expiry: formData.get("license_expiry") as string || null,
      aadhaar_number: null,
      address: formData.get("address") as string || null,
      emergency_contact: formData.get("emergency_contact") as string || null,
      salary_type: "monthly",
      salary_amount: formData.get("salary") ? parseFloat(formData.get("salary") as string) : 0,
      is_active: true,
      assigned_vehicle_id: null,
    });
    setOpen(false);
  };

  return (
    <AppLayout title="Drivers" subtitle="Manage your fleet drivers">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{drivers?.length || 0} drivers registered</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Driver</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Driver</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input name="name" required /></div>
                <div><Label>Phone *</Label><Input name="phone" required /></div>
                <div><Label>Email</Label><Input name="email" type="email" /></div>
                <div><Label>License Number</Label><Input name="license_number" /></div>
                <div><Label>License Expiry</Label><Input name="license_expiry" type="date" /></div>
                <div><Label>Monthly Salary</Label><Input name="salary" type="number" /></div>
                <div className="col-span-2"><Label>Address</Label><Input name="address" /></div>
                <div className="col-span-2"><Label>Emergency Contact</Label><Input name="emergency_contact" /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createDriver.isPending}>
                {createDriver.isPending ? "Adding..." : "Add Driver"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers?.map((driver: any) => (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{driver.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" /> {driver.phone}
                      </div>
                    </div>
                  </div>
                  <Badge className={driver.is_active ? "bg-success/10 text-success" : "bg-muted"}>
                    {driver.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {driver.license_number && (
                    <div className="flex items-center gap-2"><IdCard className="w-4 h-4 text-muted-foreground" /> {driver.license_number}</div>
                  )}
                  {driver.vehicles?.vehicle_number && (
                    <p><span className="text-muted-foreground">Vehicle:</span> {driver.vehicles.vehicle_number}</p>
                  )}
                  {driver.salary_amount > 0 && (
                    <p><span className="text-muted-foreground">Salary:</span> ₹{driver.salary_amount}/month</p>
                  )}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="destructive" size="sm" onClick={() => deleteDriver.mutate(driver.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {drivers?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No drivers added yet</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
