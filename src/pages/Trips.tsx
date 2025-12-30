import { AppLayout } from "@/components/layout/AppLayout";
import { useTrips, useCreateTrip, useUpdateTrip, useDeleteTrip } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useClients } from "@/hooks/useClients";
import { useCategories } from "@/hooks/useCategories";
import { useCreateIncome } from "@/hooks/useIncome";
import { useCreateExpense } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TripMap } from "@/components/TripMap";
import { LocationPicker } from "@/components/LocationPicker";
import { calculateHaversineDistance } from "@/hooks/useDistanceCalculation";
import { Plus, Route, MapPin, Trash2, Play, CheckCircle, Edit, Map, FileText, Loader2, Calculator } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Trips() {
  const { data: trips, isLoading } = useTrips();
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();
  const { data: clients } = useClients();
  const { data: goodsTypes } = useCategories("goods_type");
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const createIncome = useCreateIncome();
  const createExpense = useCreateExpense();
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [completingTrip, setCompletingTrip] = useState(false);

  // Form state for location picker
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropLocation, setDropLocation] = useState("");
  const [dropLat, setDropLat] = useState<number | null>(null);
  const [dropLng, setDropLng] = useState<number | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const distanceInputRef = useRef<HTMLInputElement>(null);

  // Complete journey form state
  const [tripExpenses, setTripExpenses] = useState<{ fuel: number; toll: number; other: number }>({
    fuel: 0,
    toll: 0,
    other: 0,
  });

  // Auto-calculate distance when coordinates change
  useEffect(() => {
    if (pickupLat && pickupLng && dropLat && dropLng) {
      const distance = calculateHaversineDistance(pickupLat, pickupLng, dropLat, dropLng);
      setCalculatedDistance(distance);
      if (distanceInputRef.current) {
        distanceInputRef.current.value = String(distance);
      }
    }
  }, [pickupLat, pickupLng, dropLat, dropLng]);

  const resetLocationForm = () => {
    setPickupLocation("");
    setPickupLat(null);
    setPickupLng(null);
    setDropLocation("");
    setDropLat(null);
    setDropLng(null);
    setCalculatedDistance(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createTrip.mutateAsync({
      pickup_location: pickupLocation,
      drop_location: dropLocation,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      drop_lat: dropLat,
      drop_lng: dropLng,
      vehicle_id: formData.get("vehicle_id") as string || null,
      driver_id: formData.get("driver_id") as string || null,
      client_id: formData.get("client_id") as string || null,
      goods_type: formData.get("goods_type") as string || null,
      weight: formData.get("weight") as string || null,
      distance_km: formData.get("distance") ? parseFloat(formData.get("distance") as string) : calculatedDistance,
      fare_amount: formData.get("fare") ? parseFloat(formData.get("fare") as string) : 0,
      advance_amount: formData.get("advance") ? parseFloat(formData.get("advance") as string) : 0,
      start_date: formData.get("start_date") as string || null,
      end_date: null,
      status: "created",
      payment_status: "pending",
      notes: formData.get("notes") as string || null,
    });
    setOpen(false);
    resetLocationForm();
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateTrip.mutateAsync({
      id: selectedTrip.id,
      pickup_location: pickupLocation,
      drop_location: dropLocation,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      drop_lat: dropLat,
      drop_lng: dropLng,
      vehicle_id: formData.get("vehicle_id") as string || null,
      driver_id: formData.get("driver_id") as string || null,
      client_id: formData.get("client_id") as string || null,
      goods_type: formData.get("goods_type") as string || null,
      weight: formData.get("weight") as string || null,
      distance_km: formData.get("distance") ? parseFloat(formData.get("distance") as string) : calculatedDistance,
      fare_amount: formData.get("fare") ? parseFloat(formData.get("fare") as string) : 0,
      advance_amount: formData.get("advance") ? parseFloat(formData.get("advance") as string) : 0,
      notes: formData.get("notes") as string || null,
    });
    setEditOpen(false);
    setSelectedTrip(null);
    resetLocationForm();
  };

  const openEditDialog = (trip: any) => {
    setSelectedTrip(trip);
    setPickupLocation(trip.pickup_location);
    setPickupLat(trip.pickup_lat);
    setPickupLng(trip.pickup_lng);
    setDropLocation(trip.drop_location);
    setDropLat(trip.drop_lat);
    setDropLng(trip.drop_lng);
    setCalculatedDistance(trip.distance_km);
    setEditOpen(true);
  };

  const openCompleteDialog = (trip: any) => {
    setSelectedTrip(trip);
    setTripExpenses({ fuel: 0, toll: 0, other: 0 });
    setCompleteDialogOpen(true);
  };

  const handleCompleteTrip = async () => {
    if (!selectedTrip) return;
    
    setCompletingTrip(true);
    try {
      // 1. Update trip status to completed
      await updateTrip.mutateAsync({
        id: selectedTrip.id,
        status: "completed",
        end_date: new Date().toISOString(),
        payment_status: "completed",
      });

      // 2. Add income record for the trip fare
      if (selectedTrip.fare_amount > 0) {
        await createIncome.mutateAsync({
          amount: selectedTrip.fare_amount,
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: "cash",
          trip_id: selectedTrip.id,
          client_id: selectedTrip.client_id,
          notes: `Trip fare for ${selectedTrip.trip_number}`,
          reference_number: null,
        });
      }

      // 3. Add expense records
      if (tripExpenses.fuel > 0) {
        await createExpense.mutateAsync({
          category: "fuel",
          amount: tripExpenses.fuel,
          expense_date: new Date().toISOString().split("T")[0],
          trip_id: selectedTrip.id,
          vehicle_id: selectedTrip.vehicle_id,
          driver_id: selectedTrip.driver_id,
          description: `Fuel expense for ${selectedTrip.trip_number}`,
          receipt_url: null,
        });
      }

      if (tripExpenses.toll > 0) {
        await createExpense.mutateAsync({
          category: "toll_parking",
          amount: tripExpenses.toll,
          expense_date: new Date().toISOString().split("T")[0],
          trip_id: selectedTrip.id,
          vehicle_id: selectedTrip.vehicle_id,
          driver_id: selectedTrip.driver_id,
          description: `Toll & parking for ${selectedTrip.trip_number}`,
          receipt_url: null,
        });
      }

      if (tripExpenses.other > 0) {
        await createExpense.mutateAsync({
          category: "miscellaneous",
          amount: tripExpenses.other,
          expense_date: new Date().toISOString().split("T")[0],
          trip_id: selectedTrip.id,
          vehicle_id: selectedTrip.vehicle_id,
          driver_id: selectedTrip.driver_id,
          description: `Other expenses for ${selectedTrip.trip_number}`,
          receipt_url: null,
        });
      }

      toast.success("Trip completed! Income and expenses added to finance.");
      setCompleteDialogOpen(false);
      setSelectedTrip(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete trip");
    } finally {
      setCompletingTrip(false);
    }
  };

  const generateInvoice = async (tripId: string) => {
    setGeneratingInvoice(tripId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to generate invoice");
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: { tripId },
      });

      if (error) throw error;

      // Open invoice in new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }

      toast.success("Invoice generated successfully");
    } catch (error: any) {
      console.error("Invoice error:", error);
      toast.error(error.message || "Failed to generate invoice");
    } finally {
      setGeneratingInvoice(null);
    }
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

  const TripForm = ({ trip, onSubmit, isPending, buttonText }: any) => (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LocationPicker
          label="Pickup Location *"
          address={pickupLocation}
          lat={pickupLat}
          lng={pickupLng}
          onAddressChange={setPickupLocation}
          onLocationChange={(lat, lng) => { setPickupLat(lat); setPickupLng(lng); }}
        />
        <LocationPicker
          label="Drop Location *"
          address={dropLocation}
          lat={dropLat}
          lng={dropLng}
          onAddressChange={setDropLocation}
          onLocationChange={(lat, lng) => { setDropLat(lat); setDropLng(lng); }}
        />
        <div><Label>Vehicle</Label>
          <Select name="vehicle_id" defaultValue={trip?.vehicle_id || ""}>
            <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
            <SelectContent>
              {vehicles?.map((v) => <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Driver</Label>
          <Select name="driver_id" defaultValue={trip?.driver_id || ""}>
            <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
            <SelectContent>
              {drivers?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Client</Label>
          <Select name="client_id" defaultValue={trip?.client_id || ""}>
            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>
              {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Goods Type</Label>
          <Select name="goods_type" defaultValue={trip?.goods_type || ""}>
            <SelectTrigger><SelectValue placeholder="Select goods type" /></SelectTrigger>
            <SelectContent>
              {goodsTypes?.map((g) => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Weight</Label><Input name="weight" placeholder="20 Tons" defaultValue={trip?.weight} /></div>
        <div>
          <Label className="flex items-center gap-2">
            Distance (km)
            {calculatedDistance && (
              <span className="text-xs text-success flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                Auto-calculated
              </span>
            )}
          </Label>
          <Input 
            ref={distanceInputRef} 
            name="distance" 
            type="number" 
            defaultValue={trip?.distance_km || calculatedDistance || ""} 
            placeholder={calculatedDistance ? String(calculatedDistance) : "Enter distance"}
          />
        </div>
        <div><Label>Fare Amount (₹)</Label><Input name="fare" type="number" defaultValue={trip?.fare_amount} /></div>
        <div><Label>Advance (₹)</Label><Input name="advance" type="number" defaultValue={trip?.advance_amount} /></div>
        {!trip && <div><Label>Start Date</Label><Input name="start_date" type="datetime-local" /></div>}
        <div className="md:col-span-2"><Label>Notes</Label><Input name="notes" defaultValue={trip?.notes} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !pickupLocation || !dropLocation}>
        {isPending ? "Saving..." : buttonText}
      </Button>
    </form>
  );

  return (
    <AppLayout title="Trips" subtitle="Manage your transport trips">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{trips?.length || 0} trips</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetLocationForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Trip</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create New Trip</DialogTitle></DialogHeader>
            <TripForm onSubmit={handleSubmit} isPending={createTrip.isPending} buttonText="Create Trip" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { setSelectedTrip(null); resetLocationForm(); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Trip</DialogTitle></DialogHeader>
          {selectedTrip && <TripForm trip={selectedTrip} onSubmit={handleEdit} isPending={updateTrip.isPending} buttonText="Save Changes" />}
        </DialogContent>
      </Dialog>

      {/* Complete Journey Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={(o) => { setCompleteDialogOpen(o); if (!o) setSelectedTrip(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Complete Journey
            </DialogTitle>
            <DialogDescription>
              Trip: {selectedTrip?.trip_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground">Trip Fare (Income)</p>
              <p className="text-xl font-bold text-success">{formatCurrency(selectedTrip?.fare_amount || 0)}</p>
            </div>
            
            <div className="space-y-3">
              <p className="font-medium text-sm">Trip Expenses</p>
              <div>
                <Label>Fuel Expense (₹)</Label>
                <Input
                  type="number"
                  value={tripExpenses.fuel}
                  onChange={(e) => setTripExpenses(prev => ({ ...prev, fuel: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Toll & Parking (₹)</Label>
                <Input
                  type="number"
                  value={tripExpenses.toll}
                  onChange={(e) => setTripExpenses(prev => ({ ...prev, toll: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Other Expenses (₹)</Label>
                <Input
                  type="number"
                  value={tripExpenses.other}
                  onChange={(e) => setTripExpenses(prev => ({ ...prev, other: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted border">
              <div className="flex justify-between text-sm">
                <span>Total Expenses:</span>
                <span className="text-destructive font-medium">
                  {formatCurrency(tripExpenses.fuel + tripExpenses.toll + tripExpenses.other)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Net Profit:</span>
                <span className={`font-bold ${(selectedTrip?.fare_amount || 0) - (tripExpenses.fuel + tripExpenses.toll + tripExpenses.other) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency((selectedTrip?.fare_amount || 0) - (tripExpenses.fuel + tripExpenses.toll + tripExpenses.other))}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCompleteTrip} disabled={completingTrip} className="bg-success hover:bg-success/90">
              {completingTrip ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Journey
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={(o) => { setMapOpen(o); if (!o) setSelectedTrip(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Trip Route - {selectedTrip?.trip_number}</DialogTitle></DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span><strong>Pickup:</strong> {selectedTrip.pickup_location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span><strong>Drop:</strong> {selectedTrip.drop_location}</span>
                </div>
              </div>
              <TripMap 
                pickup={selectedTrip.pickup_location} 
                drop={selectedTrip.drop_location}
                pickupCoords={selectedTrip.pickup_lat && selectedTrip.pickup_lng ? [selectedTrip.pickup_lat, selectedTrip.pickup_lng] : undefined}
                dropCoords={selectedTrip.drop_lat && selectedTrip.drop_lng ? [selectedTrip.drop_lat, selectedTrip.drop_lng] : undefined}
                className="h-[400px]" 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {trips?.map((trip) => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Route className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{trip.trip_number}</h3>
                        <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                        {trip.distance_km && (
                          <Badge variant="outline" className="text-xs">{trip.distance_km} km</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {trip.pickup_location} → {trip.drop_location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(trip.fare_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip.vehicles?.vehicle_number || "No vehicle"} • {trip.drivers?.name || "No driver"}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => generateInvoice(trip.id)} disabled={generatingInvoice === trip.id} title="Generate Invoice">
                        {generatingInvoice === trip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedTrip(trip); setMapOpen(true); }} title="View Map">
                        <Map className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(trip)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {trip.status === "created" && (
                        <Button size="sm" variant="outline" onClick={() => updateTrip.mutate({ id: trip.id, status: "running" })} title="Start Trip">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {trip.status === "running" && (
                        <Button 
                          size="sm" 
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => openCompleteDialog(trip)} 
                          title="Complete Journey"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => deleteTrip.mutate(trip.id)} title="Delete">
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
