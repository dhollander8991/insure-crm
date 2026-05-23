import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { policyApi, emailStorage } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z
  .object({
    customerId: z.coerce.number().positive("Customer ID must be positive"),
    customerName: z.string().min(1, "Required"),
    type: z.enum(["CAR", "APARTMENT", "LIFE", "HEALTH"]),
    status: z.enum(["ACTIVE", "PENDING", "CANCELLED"]),
    startDate: z.string().min(1, "Required"),
    endDate: z.string().min(1, "Required"),
    premium: z.coerce.number().positive("Must be greater than 0"),
    agentEmail: z.string().email("Valid email required"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPolicyDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "PENDING",
      type: "CAR",
      agentEmail: emailStorage.get() ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await policyApi.create(data);
      toast.success("Policy created successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      onOpenChange(false);
      reset({ status: "PENDING", type: "CAR", agentEmail: emailStorage.get() ?? "" });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create policy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Policy</DialogTitle>
          <DialogDescription>Create a new insurance policy.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input id="customerId" type="number" {...register("customerId")} />
              {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" {...register("customerName")} />
              {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                defaultValue="CAR"
                onValueChange={(v) => setValue("type", v as "CAR" | "APARTMENT" | "LIFE" | "HEALTH")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAR">Car</SelectItem>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="LIFE">Life</SelectItem>
                  <SelectItem value="HEALTH">Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                defaultValue="PENDING"
                onValueChange={(v) => setValue("status", v as "ACTIVE" | "PENDING" | "CANCELLED")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="premium">Premium ($/mo)</Label>
              <Input id="premium" type="number" step="0.01" min="0.01" {...register("premium")} />
              {errors.premium && <p className="text-xs text-destructive">{errors.premium.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="np-agentEmail">Agent Email</Label>
              <Input id="np-agentEmail" type="email" {...register("agentEmail")} />
              {errors.agentEmail && <p className="text-xs text-destructive">{errors.agentEmail.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Policy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
