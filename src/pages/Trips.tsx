import { AppLayout } from "@/components/layout/AppLayout";
import { useTrips, useCreateTrip, useUpdateTrip, useDeleteTrip } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Route, MapPin, Trash2, Play, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Trips() {
  const { data: trips, isLoading } = useTrips();
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();
  const { data: clients } = useClients();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createTrip.mutateAsync({
      pickup_location: formData.get("pickup_location") as string,
      drop_location: formData.get("drop_location") as string,
      vehicle_id: formData.get("vehicle_id") as string || null,
      driver_id: formData.get("driver_id") as string || null,
      client_id: formData.get("client_id") as string || null,
      goods_type: formData.get("goods_type") as string || null,
      weight: formData.get("weight") as string || null,
      distance_km: formData.get("distance") ? parseFloat(formData.get("distance") as string) : null,
      fare_amount: formData.get("fare") ? parseFloat(formData.get("fare") as string) : 0,
      advance_amount: formData.get("advance") ? parseFloat(formData.get("advance") as string) : 0,
      start_date: formData.get("start_date") as string || null,
      end_date: null,
      status: "created",
      payment_status: "pending",
      notes: null,
    });
    setOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success";
      case "running": return "bg-primary/10 text-primary";
      case "assigned": return "bg-warning/10 text-warning";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

  return (
    <AppLayout title="Trips" subtitle="Manage your transport trips">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{trips?.length || 0} trips</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Trip</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create New Trip</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pickup Location *</Label><Input name="pickup_location" required /></div>
                <div><Label>Drop Location *</Label><Input name="drop_location" required /></div>
                <div><Label>Vehicle</Label>
                  <Select name="vehicle_id">
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((v) => <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Driver</Label>
                  <Select name="driver_id">
                    <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                    <SelectContent>
                      {drivers?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Client</Label>
                  <Select name="client_id">
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Goods Type</Label><Input name="goods_type" /></div>
                <div><Label>Weight</Label><Input name="weight" placeholder="20 Tons" /></div>
                <div><Label>Distance (km)</Label><Input name="distance" type="number" /></div>
                <div><Label>Fare Amount (₹)</Label><Input name="fare" type="number" /></div>
                <div><Label>Advance (₹)</Label><Input name="advance" type="number" /></div>
                <div><Label>Start Date</Label><Input name="start_date" type="datetime-local" /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createTrip.isPending}>
                {createTrip.isPending ? "Creating..." : "Create Trip"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {trips?.map((trip) => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Route className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{trip.trip_number}</h3>
                        <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {trip.pickup_location} → {trip.drop_location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(trip.fare_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip.vehicles?.vehicle_number} • {trip.drivers?.name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {trip.status === "created" && (
                        <Button size="sm" variant="outline" onClick={() => updateTrip.mutate({ id: trip.id, status: "running" })}>
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {trip.status === "running" && (
                        <Button size="sm" variant="outline" onClick={() => updateTrip.mutate({ id: trip.id, status: "completed" })}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => deleteTrip.mutate(trip.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {trips?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Route className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No trips created yet</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
