import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserCredits {
  id: string;
  total_attempts: number;
  used_attempts: number;
  amount_paid: number;
}

export function useUserCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("user_credits")
      .select("id, total_attempts, used_attempts, amount_paid")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCredits(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const remainingAttempts = credits ? credits.total_attempts - credits.used_attempts : 0;
  const hasAttempts = remainingAttempts > 0;

  const consumeAttempt = useCallback(async () => {
    if (!credits || !hasAttempts) return false;

    const { error } = await supabase
      .from("user_credits")
      .update({ used_attempts: credits.used_attempts + 1 })
      .eq("id", credits.id);

    if (!error) {
      setCredits((prev) => prev ? { ...prev, used_attempts: prev.used_attempts + 1 } : null);
      return true;
    }
    return false;
  }, [credits, hasAttempts]);

  // Simulate payment (will be replaced with Paystack later)
  const simulatePayment = useCallback(async () => {
    if (!user) return false;

    if (credits) {
      // Add 7 more attempts to existing record
      const { error } = await supabase
        .from("user_credits")
        .update({
          total_attempts: credits.total_attempts + 7,
          amount_paid: credits.amount_paid + 5000,
        })
        .eq("id", credits.id);

      if (!error) {
        setCredits((prev) => prev ? {
          ...prev,
          total_attempts: prev.total_attempts + 7,
          amount_paid: prev.amount_paid + 5000,
        } : null);
        return true;
      }
    } else {
      // Create new credit record
      const { data, error } = await supabase
        .from("user_credits")
        .insert({
          user_id: user.id,
          total_attempts: 7,
          used_attempts: 0,
          amount_paid: 5000,
        })
        .select("id, total_attempts, used_attempts, amount_paid")
        .single();

      if (!error && data) {
        setCredits(data);
        return true;
      }
    }
    return false;
  }, [user, credits]);

  return { credits, loading, remainingAttempts, hasAttempts, consumeAttempt, simulatePayment, refetch: fetchCredits };
}
