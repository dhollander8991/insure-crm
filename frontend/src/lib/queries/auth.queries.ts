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

export function useRegisterMutation() {
  return useMutation({
    mutationFn: ({
      email,
      password,
      role,
    }: {
      email: string;
      password: string;
      role?: string;
    }) => authApi.register(email, password, role),
    onSuccess: (authResponse) => {
      tokenStorage.set(authResponse.token);
      emailStorage.set(authResponse.email);
    },
  });
}
