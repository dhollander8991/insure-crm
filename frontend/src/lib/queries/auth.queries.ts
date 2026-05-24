import { useMutation } from "@tanstack/react-query";

import { authApi, tokenStorage, emailStorage } from "@/lib/api";

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (authResponse) => {
      tokenStorage.set(authResponse.token);
      emailStorage.set(authResponse.email);
    },
  });
}
