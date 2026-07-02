import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate("/admin");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. You may need to confirm your email.");
        navigate("/admin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-semibold">Tradish</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-primary">Staff portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage the menu and orders.</p>
          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6" />
            <TabsContent value="signup" className="mt-6" />
          </Tabs>
          <form onSubmit={handle} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required autoComplete={tab === "signin" ? "current-password" : "new-password"} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {tab === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to Tradish</Link>
          </p>
        </div>
      </div>
    </div>
  );
}