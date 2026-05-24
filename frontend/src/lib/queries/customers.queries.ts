import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { customerApi, type CustomerResponse } from "@/lib/api";

export const CUSTOMER_QUERY_KEYS = {
  all: ["customers"] as const,
  byId: (customerId: number) => ["customers", customerId] as const,
  byAgent: (agentEmail: string) => ["customers", "agent", agentEmail] as const,
};

export function useCustomersQuery(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.all,
    queryFn: customerApi.getAll,
    ...options,
  });
}

export function useCustomerByIdQuery(customerId: number) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.byId(customerId),
    queryFn: () => customerApi.getById(customerId),
    enabled: !!customerId,
  });
}

export function useCustomersByAgentQuery(agentEmail: string) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.byAgent(agentEmail),
    queryFn: () => customerApi.getByAgent(agentEmail),
    enabled: !!agentEmail,
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.all });
    },
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CustomerResponse>;
    }) => customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.all });
    },
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.all });
    },
  });
}
