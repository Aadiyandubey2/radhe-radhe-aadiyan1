import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Mail, Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import logoImg from "@/assets/logo.png";

// Simple hash function for PIN storage
const hashPin = (pin: string) => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const PIN_STORAGE_KEY = "rrt_pin_hash";
const PIN_SET_KEY = "rrt_pin_set";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [isPinSet, setIsPinSet] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const { signIn, signInWithPin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsPinSet(localStorage.getItem(PIN_SET_KEY) === "true");
  }, []);

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handlePinLogin = async () => {
    if (pin.length !== 4) {
      toast.error("Please enter 4-digit PIN / 4 अंकों का पिन दर्ज करें");
      return;
    }

    const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
    if (storedHash && hashPin(pin) === storedHash) {
      setIsLoading(true);
      const { error } = await signInWithPin();
      setIsLoading(false);
      
      if (error) {
        toast.error("Login failed / लॉगिन विफल");
        return;
      }
      
      toast.success("🙏 स्वागत है! Welcome!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid PIN / गलत पिन");
      setPin("");
    }
  };

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      toast.error("PIN must be 4 digits / पिन 4 अंकों का होना चाहिए");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs don't match / पिन मेल नहीं खाता");
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, hashPin(newPin));
    localStorage.setItem(PIN_SET_KEY, "true");
    setIsPinSet(true);
    setIsSettingPin(false);
    setNewPin("");
    setConfirmPin("");
    toast.success("PIN set successfully! / पिन सेट हो गया!");
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast.error("Invalid credentials / गलत ईमेल या पासवर्ड");
    } else {
      toast.success("🙏 स्वागत है! Welcome back!");
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8B0000] via-[#A52A2A] to-[#CD5C5C] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <img src={logoImg} alt="Radhe Radhe Transport" className="w-24 h-24 rounded-2xl mb-8 shadow-2xl" />
          <h1 className="text-4xl font-display font-bold mb-2 text-center">🙏 राधे राधे</h1>
          <h2 className="text-2xl font-semibold mb-4 text-center text-white/90">Transport Service</h2>
          <p className="text-lg text-white/70 text-center max-w-md mb-8">
            विश्वसनीय परिवहन सेवा / Trusted Transport Solution
          </p>
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            {[
              "वाहन प्रबंधन / Vehicles",
              "यात्रा ट्रैकिंग / Trips",
              "वित्तीय विश्लेषण / Finance",
              "चालक प्रबंधन / Drivers",
              "ग्राहक बिलिंग / Billing",
              "रिपोर्ट्स / Reports",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-white/80"
              >
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                {feature}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#8B0000] to-transparent" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={logoImg} alt="Radhe Radhe" className="w-16 h-16 rounded-xl" />
            </div>
            <CardTitle className="text-2xl font-display">🙏 राधे राधे Transport</CardTitle>
            <CardDescription>लॉगिन करें / Login to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pin" className="gap-2">
                  <KeyRound className="w-4 h-4" /> PIN
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="w-4 h-4" /> Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pin">
                {!isPinSet || isSettingPin ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {isSettingPin ? "Set your 4-digit PIN / अपना 4 अंकों का पिन सेट करें" : "First time? Set your PIN / पहली बार? पिन सेट करें"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">New PIN / नया पिन</Label>
                        <div className="flex justify-center mt-2">
                          <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Confirm PIN / पिन पुष्टि करें</Label>
                        <div className="flex justify-center mt-2">
                          <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>
                      <Button onClick={handleSetPin} className="w-full bg-[#8B0000] hover:bg-[#A52A2A]">
                        Set PIN / पिन सेट करें
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your 4-digit PIN / अपना 4 अंकों का पिन दर्ज करें
                    </p>
                    <div className="flex justify-center">
                      <InputOTP maxLength={4} value={pin} onChange={setPin}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-14 h-14 text-xl" />
                          <InputOTPSlot index={1} className="w-14 h-14 text-xl" />
                          <InputOTPSlot index={2} className="w-14 h-14 text-xl" />
                          <InputOTPSlot index={3} className="w-14 h-14 text-xl" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button onClick={handlePinLogin} className="w-full bg-[#8B0000] hover:bg-[#A52A2A]">
                      Login / लॉगिन <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="link" size="sm" onClick={() => setIsSettingPin(true)} className="text-muted-foreground">
                      Change PIN / पिन बदलें
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="email">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">ईमेल / Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">पासवर्ड / Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#8B0000] hover:bg-[#A52A2A]" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        लॉगिन करें / Sign In <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                व्यक्तिगत उपयोग के लिए / For personal business use
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
