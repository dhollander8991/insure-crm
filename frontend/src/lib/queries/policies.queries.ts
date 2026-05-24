import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { policyApi, type PolicyResponse } from "@/lib/api";

export const POLICY_QUERY_KEYS = {
  all: ["policies"] as const,
  byId: (policyId: number) => ["policies", policyId] as const,
  byCustomer: (customerId: number) =>
    ["policies", "customer", customerId] as const,
  byAgent: (agentEmail: string) => ["policies", "agent", agentEmail] as const,
  byStatus: (status: string) => ["policies", "status", status] as const,
};

export function usePoliciesQuery(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: POLICY_QUERY_KEYS.all,
    queryFn: policyApi.getAll,
    ...options,
  });
}

export function usePolicyByIdQuery(policyId: number) {
  return useQuery({
    queryKey: POLICY_QUERY_KEYS.byId(policyId),
    queryFn: () => policyApi.getById(policyId),
    enabled: !!policyId,
  });
}

export function usePoliciesByCustomerQuery(customerId: number) {
  return useQuery({
    queryKey: POLICY_QUERY_KEYS.byCustomer(customerId),
    queryFn: () => policyApi.getByCustomer(customerId),
    enabled: !!customerId,
  });
}

export function usePoliciesByAgentQuery(agentEmail: string) {
  return useQuery({
    queryKey: POLICY_QUERY_KEYS.byAgent(agentEmail),
    queryFn: () => policyApi.getByAgent(agentEmail),
    enabled: !!agentEmail,
  });
}

export function useCreatePolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: policyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_QUERY_KEYS.all });
    },
  });
}

export function useUpdatePolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PolicyResponse> }) =>
      policyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_QUERY_KEYS.all });
    },
  });
}

export function useDeletePolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: policyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_QUERY_KEYS.all });
    },
  });
}
