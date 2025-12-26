import { useState } from "react";
import { usePinUsers } from "@/hooks/usePinUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Plus, Pencil, Trash2, User, KeyRound, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export function PinUserManager() {
  const { pinUsers, isLoading, createPinUser, updatePinUser, deletePinUser, togglePinUser } = usePinUsers();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Please enter a name / नाम दर्ज करें");
      return;
    }
    if (newPin.length !== 4) {
      toast.error("PIN must be 4 digits / पिन 4 अंकों का होना चाहिए");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs don't match / पिन मेल नहीं खाता");
      return;
    }

    createPinUser.mutate({ name: newName.trim(), pin: newPin });
    setNewName("");
    setNewPin("");
    setConfirmPin("");
    setIsAddOpen(false);
  };

  const handleUpdatePin = (id: string) => {
    if (newPin.length !== 4) {
      toast.error("PIN must be 4 digits / पिन 4 अंकों का होना चाहिए");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs don't match / पिन मेल नहीं खाता");
      return;
    }

    updatePinUser.mutate({ id, pin: newPin });
    setNewPin("");
    setConfirmPin("");
    setEditingUser(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete PIN user "${name}"? / "${name}" को हटाना है?`)) {
      deletePinUser.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            PIN Users / पिन उपयोगकर्ता
          </CardTitle>
          <CardDescription>
            Manage PIN login users / पिन लॉगिन उपयोगकर्ता प्रबंधित करें
          </CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#8B0000] hover:bg-[#A52A2A]">
              <Plus className="w-4 h-4 mr-1" /> Add / जोड़ें
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add PIN User / पिन उपयोगकर्ता जोड़ें</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name / नाम</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Driver name / चालक का नाम"
                />
              </div>
              <div>
                <Label>PIN / पिन</Label>
                <div className="flex justify-center mt-2">
                  <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12" />
                      <InputOTPSlot index={1} className="w-12 h-12" />
                      <InputOTPSlot index={2} className="w-12 h-12" />
                      <InputOTPSlot index={3} className="w-12 h-12" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div>
                <Label>Confirm PIN / पिन पुष्टि करें</Label>
                <div className="flex justify-center mt-2">
                  <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12" />
                      <InputOTPSlot index={1} className="w-12 h-12" />
                      <InputOTPSlot index={2} className="w-12 h-12" />
                      <InputOTPSlot index={3} className="w-12 h-12" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-[#8B0000] hover:bg-[#A52A2A]">
                Create / बनाएं
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {pinUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No PIN users yet. Add one to allow quick login. / अभी कोई पिन उपयोगकर्ता नहीं है।
          </p>
        ) : (
          <div className="space-y-3">
            {pinUsers.map((pinUser) => (
              <div
                key={pinUser.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  pinUser.is_active ? "bg-card" : "bg-muted/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{pinUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pinUser.is_active ? "Active / सक्रिय" : "Inactive / निष्क्रिय"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePinUser.mutate({ id: pinUser.id, is_active: !pinUser.is_active })}
                    title={pinUser.is_active ? "Deactivate" : "Activate"}
                  >
                    {pinUser.is_active ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Dialog open={editingUser === pinUser.id} onOpenChange={(open) => {
                    setEditingUser(open ? pinUser.id : null);
                    if (!open) {
                      setNewPin("");
                      setConfirmPin("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change PIN for {pinUser.name} / पिन बदलें</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>New PIN / नया पिन</Label>
                          <div className="flex justify-center mt-2">
                            <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} className="w-12 h-12" />
                                <InputOTPSlot index={1} className="w-12 h-12" />
                                <InputOTPSlot index={2} className="w-12 h-12" />
                                <InputOTPSlot index={3} className="w-12 h-12" />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </div>
                        <div>
                          <Label>Confirm PIN / पिन पुष्टि करें</Label>
                          <div className="flex justify-center mt-2">
                            <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} className="w-12 h-12" />
                                <InputOTPSlot index={1} className="w-12 h-12" />
                                <InputOTPSlot index={2} className="w-12 h-12" />
                                <InputOTPSlot index={3} className="w-12 h-12" />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </div>
                        <Button onClick={() => handleUpdatePin(pinUser.id)} className="w-full bg-[#8B0000] hover:bg-[#A52A2A]">
                          Update PIN / पिन अपडेट करें
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(pinUser.id, pinUser.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
