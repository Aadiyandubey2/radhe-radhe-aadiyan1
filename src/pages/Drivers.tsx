import { AppLayout } from "@/components/layout/AppLayout";
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Phone, Trash2, IdCard, Edit } from "lucide-react";
import { useState } from "react";

export default function Drivers() {
  const { data: drivers, isLoading } = useDrivers();
  const { data: vehicles } = useVehicles();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createDriver.mutateAsync({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string || null,
      license_number: formData.get("license_number") as string || null,
      license_expiry: formData.get("license_expiry") as string || null,
      aadhaar_number: formData.get("aadhaar_number") as string || null,
      address: formData.get("address") as string || null,
      emergency_contact: formData.get("emergency_contact") as string || null,
      salary_type: formData.get("salary_type") as string || "monthly",
      salary_amount: formData.get("salary") ? parseFloat(formData.get("salary") as string) : 0,
      is_active: true,
      assigned_vehicle_id: formData.get("assigned_vehicle_id") as string || null,
    });
    setOpen(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateDriver.mutateAsync({
      id: selectedDriver.id,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string || null,
      license_number: formData.get("license_number") as string || null,
      license_expiry: formData.get("license_expiry") as string || null,
      aadhaar_number: formData.get("aadhaar_number") as string || null,
      address: formData.get("address") as string || null,
      emergency_contact: formData.get("emergency_contact") as string || null,
      salary_type: formData.get("salary_type") as string || "monthly",
      salary_amount: formData.get("salary") ? parseFloat(formData.get("salary") as string) : 0,
      is_active: formData.get("is_active") === "true",
      assigned_vehicle_id: formData.get("assigned_vehicle_id") as string || null,
    });
    setEditOpen(false);
    setSelectedDriver(null);
  };

  const DriverForm = ({ driver, onSubmit, isPending, buttonText }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name *</Label><Input name="name" defaultValue={driver?.name} required /></div>
        <div><Label>Phone *</Label><Input name="phone" defaultValue={driver?.phone} required /></div>
        <div><Label>Email</Label><Input name="email" type="email" defaultValue={driver?.email} /></div>
        <div><Label>License Number</Label><Input name="license_number" defaultValue={driver?.license_number} /></div>
        <div><Label>License Expiry</Label><Input name="license_expiry" type="date" defaultValue={driver?.license_expiry} /></div>
        <div><Label>Aadhaar Number</Label><Input name="aadhaar_number" defaultValue={driver?.aadhaar_number} /></div>
        <div><Label>Salary Type</Label>
          <Select name="salary_type" defaultValue={driver?.salary_type || "monthly"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="per_trip">Per Trip</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Salary Amount</Label><Input name="salary" type="number" defaultValue={driver?.salary_amount} /></div>
        <div><Label>Assigned Vehicle</Label>
          <Select name="assigned_vehicle_id" defaultValue={driver?.assigned_vehicle_id || ""}>
            <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
            <SelectContent>
              {vehicles?.map((v) => <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {driver && (
          <div><Label>Status</Label>
            <Select name="is_active" defaultValue={driver?.is_active ? "true" : "false"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="col-span-2"><Label>Address</Label><Input name="address" defaultValue={driver?.address} /></div>
        <div className="col-span-2"><Label>Emergency Contact</Label><Input name="emergency_contact" defaultValue={driver?.emergency_contact} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : buttonText}
      </Button>
    </form>
  );

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
            <DriverForm onSubmit={handleSubmit} isPending={createDriver.isPending} buttonText="Add Driver" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setSelectedDriver(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Driver</DialogTitle></DialogHeader>
          {selectedDriver && <DriverForm driver={selectedDriver} onSubmit={handleEdit} isPending={updateDriver.isPending} buttonText="Save Changes" />}
        </DialogContent>
      </Dialog>

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
                    <p><span className="text-muted-foreground">Salary:</span> ₹{driver.salary_amount}/{driver.salary_type || "month"}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedDriver(driver); setEditOpen(true); }}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
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
