import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck,
  Users,
  Route,
  Building2,
  Wallet,
  Receipt,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingGuideProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome! / स्वागत है!",
    titleHi: "आपका स्वागत है!",
    description: "Let's set up your transport management system step by step.",
    descriptionHi: "आइए आपके परिवहन प्रबंधन सिस्टम को सेट करें।",
    icon: CheckCircle,
    action: null,
    actionLabel: null,
  },
  {
    id: 2,
    title: "Add Vehicles / वाहन जोड़ें",
    titleHi: "वाहन जोड़ें",
    description: "Start by adding your trucks and vehicles to the system. Include registration numbers, type, and capacity.",
    descriptionHi: "पहले अपने ट्रक और वाहन सिस्टम में जोड़ें। रजिस्ट्रेशन नंबर, प्रकार और क्षमता शामिल करें।",
    icon: Truck,
    action: "/vehicles",
    actionLabel: "Add Vehicle / वाहन जोड़ें",
  },
  {
    id: 3,
    title: "Add Drivers / ड्राइवर जोड़ें",
    titleHi: "ड्राइवर जोड़ें",
    description: "Register your drivers with their license details, contact information, and salary structure.",
    descriptionHi: "अपने ड्राइवरों को उनके लाइसेंस विवरण, संपर्क जानकारी और वेतन संरचना के साथ पंजीकृत करें।",
    icon: Users,
    action: "/drivers",
    actionLabel: "Add Driver / ड्राइवर जोड़ें",
  },
  {
    id: 4,
    title: "Add Clients / ग्राहक जोड़ें",
    titleHi: "ग्राहक जोड़ें",
    description: "Add your regular clients for easy booking and billing. Include company name, GST, and contact details.",
    descriptionHi: "आसान बुकिंग और बिलिंग के लिए अपने नियमित ग्राहकों को जोड़ें।",
    icon: Building2,
    action: "/clients",
    actionLabel: "Add Client / ग्राहक जोड़ें",
  },
  {
    id: 5,
    title: "Create Trips / यात्रा बनाएं",
    titleHi: "यात्रा बनाएं",
    description: "Create trips by selecting pickup/drop locations, assigning vehicles and drivers, and setting fare amounts.",
    descriptionHi: "पिकअप/ड्रॉप स्थान चुनकर, वाहन और ड्राइवर असाइन करके और किराया राशि सेट करके यात्राएं बनाएं।",
    icon: Route,
    action: "/trips",
    actionLabel: "Create Trip / यात्रा बनाएं",
  },
  {
    id: 6,
    title: "Track Finances / वित्त ट्रैक करें",
    titleHi: "वित्त ट्रैक करें",
    description: "Record income from trips and track expenses like fuel, maintenance, tolls, and driver salaries.",
    descriptionHi: "यात्राओं से आय दर्ज करें और ईंधन, रखरखाव, टोल और ड्राइवर वेतन जैसे खर्चों को ट्रैक करें।",
    icon: Wallet,
    action: "/finance",
    actionLabel: "Manage Finance / वित्त प्रबंधन",
  },
  {
    id: 7,
    title: "Generate Bills / बिल बनाएं",
    titleHi: "बिल बनाएं",
    description: "Create professional invoices for your clients with all trip details and GST calculations.",
    descriptionHi: "अपने ग्राहकों के लिए सभी यात्रा विवरण और GST गणना के साथ पेशेवर चालान बनाएं।",
    icon: Receipt,
    action: "/billing",
    actionLabel: "Create Bill / बिल बनाएं",
  },
  {
    id: 8,
    title: "You're All Set! / तैयार हैं!",
    titleHi: "आप तैयार हैं!",
    description: "You now know how to use Radhe Radhe Transport. Explore the dashboard to see analytics and reports.",
    descriptionHi: "अब आप राधे राधे ट्रांसपोर्ट का उपयोग करना जानते हैं। एनालिटिक्स और रिपोर्ट देखने के लिए डैशबोर्ड देखें।",
    icon: CheckCircle,
    action: null,
    actionLabel: null,
  },
];

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    if (step.action) {
      onComplete();
      navigate(step.action);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-2">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onComplete}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          <div className="flex justify-center mb-4">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center",
              isFirstStep || isLastStep 
                ? "bg-gradient-to-br from-[#8B0000] to-[#CD5C5C]" 
                : "bg-primary/10"
            )}>
              <Icon className={cn(
                "w-10 h-10",
                isFirstStep || isLastStep ? "text-white" : "text-primary"
              )} />
            </div>
          </div>

          <CardTitle className="text-center text-xl">
            {step.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {step.description}
          </p>
          <p className="text-center text-sm text-muted-foreground/80">
            {step.descriptionHi}
          </p>

          {/* Action Button */}
          {step.action && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAction}
            >
              {step.actionLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back / पीछे
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>

            <Button
              onClick={handleNext}
              className={cn(
                "gap-2",
                isLastStep && "bg-[#8B0000] hover:bg-[#A52A2A]"
              )}
            >
              {isLastStep ? "Start / शुरू करें" : "Next / आगे"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
