import { AppLayout } from "@/components/layout/AppLayout";
import { useVehicles, useCreateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck, Trash2, Calendar, Fuel } from "lucide-react";
import { useState } from "react";

export default function Vehicles() {
  const { data: vehicles, isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createVehicle.mutateAsync({
      vehicle_number: formData.get("vehicle_number") as string,
      vehicle_type: formData.get("vehicle_type") as string,
      make: formData.get("make") as string || null,
      model: formData.get("model") as string || null,
      year: formData.get("year") ? parseInt(formData.get("year") as string) : null,
      fuel_type: formData.get("fuel_type") as string || "diesel",
      capacity: formData.get("capacity") as string || null,
      status: "active",
      registration_expiry: formData.get("registration_expiry") as string || null,
      insurance_expiry: formData.get("insurance_expiry") as string || null,
      fitness_expiry: null,
      permit_expiry: null,
    });
    setOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success";
      case "maintenance": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout title="Vehicles" subtitle="Manage your fleet vehicles">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{vehicles?.length || 0} vehicles registered</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Vehicle</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Vehicle Number *</Label><Input name="vehicle_number" placeholder="MH12AB1234" required /></div>
                <div><Label>Vehicle Type *</Label>
                  <Select name="vehicle_type" required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="trailer">Trailer</SelectItem>
                      <SelectItem value="tanker">Tanker</SelectItem>
                      <SelectItem value="container">Container</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Make</Label><Input name="make" placeholder="Tata" /></div>
                <div><Label>Model</Label><Input name="model" placeholder="Prima" /></div>
                <div><Label>Year</Label><Input name="year" type="number" placeholder="2023" /></div>
                <div><Label>Fuel Type</Label>
                  <Select name="fuel_type" defaultValue="diesel">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Capacity</Label><Input name="capacity" placeholder="20 Tons" /></div>
                <div><Label>Insurance Expiry</Label><Input name="insurance_expiry" type="date" /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createVehicle.isPending}>
                {createVehicle.isPending ? "Adding..." : "Add Vehicle"}
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
          {vehicles?.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vehicle.vehicle_number}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{vehicle.vehicle_type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {vehicle.make && <p><span className="text-muted-foreground">Make:</span> {vehicle.make} {vehicle.model}</p>}
                  {vehicle.capacity && <p><span className="text-muted-foreground">Capacity:</span> {vehicle.capacity}</p>}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fuel className="w-4 h-4" /> {vehicle.fuel_type}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="destructive" size="sm" onClick={() => deleteVehicle.mutate(vehicle.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {vehicles?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No vehicles added yet</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
