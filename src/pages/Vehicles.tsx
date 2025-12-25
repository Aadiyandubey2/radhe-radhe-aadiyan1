import { AppLayout } from "@/components/layout/AppLayout";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck, Trash2, Fuel, Edit } from "lucide-react";
import { useState } from "react";

export default function Vehicles() {
  const { data: vehicles, isLoading } = useVehicles();
  const { data: vehicleTypeCategories } = useCategories("vehicle_type");
  const { data: fuelTypeCategories } = useCategories("fuel_type");

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

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
      fitness_expiry: formData.get("fitness_expiry") as string || null,
      permit_expiry: formData.get("permit_expiry") as string || null,
    });
    setOpen(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateVehicle.mutateAsync({
      id: selectedVehicle.id,
      vehicle_number: formData.get("vehicle_number") as string,
      vehicle_type: formData.get("vehicle_type") as string,
      make: formData.get("make") as string || null,
      model: formData.get("model") as string || null,
      year: formData.get("year") ? parseInt(formData.get("year") as string) : null,
      fuel_type: formData.get("fuel_type") as string || "diesel",
      capacity: formData.get("capacity") as string || null,
      status: formData.get("status") as any,
      registration_expiry: formData.get("registration_expiry") as string || null,
      insurance_expiry: formData.get("insurance_expiry") as string || null,
      fitness_expiry: formData.get("fitness_expiry") as string || null,
      permit_expiry: formData.get("permit_expiry") as string || null,
    });
    setEditOpen(false);
    setSelectedVehicle(null);
  };

  const normalizeKey = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const mapVehicleTypeValue = (name: string) => {
    const n = normalizeKey(name);
    if (n.includes("mini") && n.includes("truck")) return "mini_truck";
    if (n.includes("truck")) return "truck";
    if (n.includes("trailer")) return "trailer";
    if (n.includes("tanker")) return "tanker";
    if (n.includes("container")) return "container";
    if (n.includes("car")) return "car";
    return n;
  };

  const mapFuelTypeValue = (name: string) => {
    const n = normalizeKey(name);
    if (n.includes("diesel")) return "diesel";
    if (n.includes("petrol")) return "petrol";
    if (n.includes("cng")) return "cng";
    if (n.includes("electric")) return "electric";
    return n;
  };

  const vehicleTypeOptions = (vehicleTypeCategories?.length ? vehicleTypeCategories : [
    { id: "static-truck", name: "Truck" },
    { id: "static-trailer", name: "Trailer" },
    { id: "static-tanker", name: "Tanker" },
    { id: "static-container", name: "Container" },
  ]).map((c: any) => ({ value: mapVehicleTypeValue(c.name), label: c.name }));

  const fuelTypeOptions = (fuelTypeCategories?.length ? fuelTypeCategories : [
    { id: "static-diesel", name: "Diesel" },
    { id: "static-petrol", name: "Petrol" },
    { id: "static-cng", name: "CNG" },
    { id: "static-electric", name: "Electric" },
  ]).map((c: any) => ({ value: mapFuelTypeValue(c.name), label: c.name }));

  const vehicleTypeLabel = (value?: string) =>
    vehicleTypeOptions.find((o) => o.value === value)?.label || (value ? value.replace(/_/g, " ") : "");

  const fuelTypeLabel = (value?: string) =>
    fuelTypeOptions.find((o) => o.value === value)?.label || (value ? value.replace(/_/g, " ") : "");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success";
      case "maintenance": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const VehicleForm = ({ vehicle, onSubmit, isPending, buttonText }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Vehicle Number *</Label><Input name="vehicle_number" placeholder="MH12AB1234" defaultValue={vehicle?.vehicle_number} required /></div>
        <div><Label>Vehicle Type *</Label>
          <Select name="vehicle_type" defaultValue={vehicle?.vehicle_type || ""} required>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {vehicleTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Make</Label><Input name="make" placeholder="Tata" defaultValue={vehicle?.make} /></div>
        <div><Label>Model</Label><Input name="model" placeholder="Prima" defaultValue={vehicle?.model} /></div>
        <div><Label>Year</Label><Input name="year" type="number" placeholder="2023" defaultValue={vehicle?.year} /></div>
        <div><Label>Fuel Type</Label>
          <Select name="fuel_type" defaultValue={vehicle?.fuel_type || "diesel"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {fuelTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Capacity</Label><Input name="capacity" placeholder="20 Tons" defaultValue={vehicle?.capacity} /></div>
        {vehicle && (
          <div><Label>Status</Label>
            <Select name="status" defaultValue={vehicle?.status || "active"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div><Label>Registration Expiry</Label><Input name="registration_expiry" type="date" defaultValue={vehicle?.registration_expiry} /></div>
        <div><Label>Insurance Expiry</Label><Input name="insurance_expiry" type="date" defaultValue={vehicle?.insurance_expiry} /></div>
        <div><Label>Fitness Expiry</Label><Input name="fitness_expiry" type="date" defaultValue={vehicle?.fitness_expiry} /></div>
        <div><Label>Permit Expiry</Label><Input name="permit_expiry" type="date" defaultValue={vehicle?.permit_expiry} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : buttonText}
      </Button>
    </form>
  );

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
            <VehicleForm onSubmit={handleSubmit} isPending={createVehicle.isPending} buttonText="Add Vehicle" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setSelectedVehicle(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Vehicle</DialogTitle></DialogHeader>
          {selectedVehicle && <VehicleForm vehicle={selectedVehicle} onSubmit={handleEdit} isPending={updateVehicle.isPending} buttonText="Save Changes" />}
        </DialogContent>
      </Dialog>

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
                      <p className="text-sm text-muted-foreground capitalize">{vehicleTypeLabel(vehicle.vehicle_type)}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {vehicle.make && <p><span className="text-muted-foreground">Make:</span> {vehicle.make} {vehicle.model}</p>}
                  {vehicle.capacity && <p><span className="text-muted-foreground">Capacity:</span> {vehicle.capacity}</p>}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fuel className="w-4 h-4" /> {fuelTypeLabel(vehicle.fuel_type)}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setEditOpen(true); }}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
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
