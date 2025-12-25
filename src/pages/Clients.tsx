import { AppLayout } from "@/components/layout/AppLayout";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Building2, Phone, Mail, Trash2, Edit } from "lucide-react";
import { useState } from "react";

export default function Clients() {
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createClient.mutateAsync({
      name: fd.get("name") as string,
      company_name: fd.get("company_name") as string || null,
      phone: fd.get("phone") as string || null,
      email: fd.get("email") as string || null,
      gst_number: fd.get("gst_number") as string || null,
      address: fd.get("address") as string || null,
      billing_address: fd.get("billing_address") as string || null,
    });
    setOpen(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateClient.mutateAsync({
      id: selectedClient.id,
      name: fd.get("name") as string,
      company_name: fd.get("company_name") as string || null,
      phone: fd.get("phone") as string || null,
      email: fd.get("email") as string || null,
      gst_number: fd.get("gst_number") as string || null,
      address: fd.get("address") as string || null,
      billing_address: fd.get("billing_address") as string || null,
    });
    setEditOpen(false);
    setSelectedClient(null);
  };

  const ClientForm = ({ client, onSubmit, isPending, buttonText }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Contact Name *</Label><Input name="name" defaultValue={client?.name} required /></div>
        <div><Label>Company Name</Label><Input name="company_name" defaultValue={client?.company_name} /></div>
        <div><Label>Phone</Label><Input name="phone" defaultValue={client?.phone} /></div>
        <div><Label>Email</Label><Input name="email" type="email" defaultValue={client?.email} /></div>
        <div><Label>GST Number</Label><Input name="gst_number" defaultValue={client?.gst_number} /></div>
        <div className="col-span-2"><Label>Address</Label><Input name="address" defaultValue={client?.address} /></div>
        <div className="col-span-2"><Label>Billing Address</Label><Input name="billing_address" defaultValue={client?.billing_address} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : buttonText}
      </Button>
    </form>
  );

  return (
    <AppLayout title="Clients" subtitle="Manage your customers">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{clients?.length || 0} clients</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Client</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
            <ClientForm onSubmit={handleSubmit} isPending={createClient.isPending} buttonText="Add Client" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setSelectedClient(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
          {selectedClient && <ClientForm client={selectedClient} onSubmit={handleEdit} isPending={updateClient.isPending} buttonText="Save Changes" />}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      {client.company_name && <p className="text-sm text-muted-foreground">{client.company_name}</p>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {client.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {client.phone}</div>}
                  {client.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {client.email}</div>}
                  {client.gst_number && <p><span className="text-muted-foreground">GST:</span> {client.gst_number}</p>}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedClient(client); setEditOpen(true); }}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteClient.mutate(client.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {clients?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No clients added yet</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
