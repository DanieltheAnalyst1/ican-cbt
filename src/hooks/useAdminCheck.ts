import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const useAdminCheck = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  return { isAdmin, isLoading };
};
