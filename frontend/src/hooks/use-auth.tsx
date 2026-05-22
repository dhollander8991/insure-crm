import { useEffect, useState } from "react";
import { tokenStorage, emailStorage } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.get();
    const email = emailStorage.get();
    setUser(token && email ? email : null);
    setLoading(false);
  }, []);

  return { user, loading };
}
