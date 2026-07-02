import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data.user) setState({ loading: false, user: null });
      else setState({ loading: false, user: data.user });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState({ loading: false, user: session?.user ?? null });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state.loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!state.user) return <Navigate to="/auth" replace />;
  return typeof children === "function" ? children(state.user) : children;
}