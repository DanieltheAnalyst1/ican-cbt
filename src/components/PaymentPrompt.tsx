import { Lock, CreditCard, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentPromptProps {
  onPay: () => void;
  loading?: boolean;
  attemptsExhausted?: boolean;
}

const PaymentPrompt = ({ onPay, loading, attemptsExhausted }: PaymentPromptProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md overflow-hidden border border-border shadow-2xl animate-fade-in">
        <div className="gradient-primary p-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">
            {attemptsExhausted ? "Attempts Exhausted" : "Exam Access Required"}
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/70">
            {attemptsExhausted
              ? "You've used all your exam attempts. Purchase more to continue practicing."
              : "Purchase exam access to start practicing for your ICAN exams."}
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Exam Access Pack</span>
              <span className="text-2xl font-bold text-foreground">₦5,000</span>
            </div>
            <div className="space-y-2">
              {[
                "7 exam attempts across all exams",
                "Full access to all published exams",
                "Detailed results & model answers",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onPay}
            disabled={loading}
            className="gradient-primary gradient-btn-hover w-full rounded-xl py-3.5 text-base font-bold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="h-5 w-5" />
            {loading ? "Processing..." : "Pay ₦5,000"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Payment powered by Paystack. Secure & encrypted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPrompt;
