import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import styles from "./NewPolicyDialog.module.css";

import { emailStorage } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useCreatePolicyMutation } from "@/lib/queries/policies.queries";

const newPolicySchema = z
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

type NewPolicyFormData = z.infer<typeof newPolicySchema>;

interface NewPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPolicyDialog({ open, onOpenChange }: NewPolicyDialogProps) {
  const createPolicyMutation = useCreatePolicyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<NewPolicyFormData>({
    resolver: zodResolver(newPolicySchema),
    defaultValues: {
      status: "PENDING",
      type: "CAR",
      agentEmail: emailStorage.get() ?? "",
    },
  });

  const submitNewPolicyForm = async (formData: NewPolicyFormData) => {
    try {
      await createPolicyMutation.mutateAsync(formData);
      toast.success("Policy created successfully");
      onOpenChange(false);
      reset({
        status: "PENDING",
        type: "CAR",
        agentEmail: emailStorage.get() ?? "",
      });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create policy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>New Policy</DialogTitle>
          <DialogDescription>Create a new insurance policy.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submitNewPolicyForm)}
          className={styles.form}
        >
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                type="number"
                data-testid="customerId-input"
                {...register("customerId")}
              />
              {errors.customerId && (
                <p className={styles.fieldError}>{errors.customerId.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                data-testid="customerName-input"
                {...register("customerName")}
              />
              {errors.customerName && (
                <p className={styles.fieldError}>
                  {errors.customerName.message}
                </p>
              )}
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label>Type</Label>
              <Select
                defaultValue="CAR"
                onValueChange={(selectedValue) =>
                  setValue(
                    "type",
                    selectedValue as "CAR" | "APARTMENT" | "LIFE" | "HEALTH",
                  )
                }
              >
                <SelectTrigger data-testid="type-select">
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
            <div className={styles.field}>
              <Label>Status</Label>
              <Select
                defaultValue="PENDING"
                onValueChange={(selectedValue) =>
                  setValue(
                    "status",
                    selectedValue as "ACTIVE" | "PENDING" | "CANCELLED",
                  )
                }
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

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                data-testid="startDate-input"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className={styles.fieldError}>{errors.startDate.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                data-testid="endDate-input"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className={styles.fieldError}>{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label htmlFor="premium">Premium ($/mo)</Label>
              <Input
                id="premium"
                type="number"
                step="0.01"
                min="0.01"
                data-testid="premium-input"
                {...register("premium")}
              />
              {errors.premium && (
                <p className={styles.fieldError}>{errors.premium.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <Label htmlFor="np-agentEmail">Agent Email</Label>
              <Input
                id="np-agentEmail"
                type="email"
                {...register("agentEmail")}
              />
              {errors.agentEmail && (
                <p className={styles.fieldError}>{errors.agentEmail.message}</p>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPolicyMutation.isPending}
              data-testid="submit-button"
            >
              {createPolicyMutation.isPending && (
                <Loader2 className={styles.spinner} />
              )}
              Create Policy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
