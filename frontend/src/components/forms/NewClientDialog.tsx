import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import styles from "./NewClientDialog.module.css";

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
import { useCreateCustomerMutation } from "@/lib/queries/customers.queries";

const newClientSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(9, "Format: 05X-XXXXXXX"),
  israeliId: z.string().regex(/^\d{9}$/, "Must be exactly 9 digits"),
  dateOfBirth: z.string().min(1, "Required"),
  status: z.enum(["ACTIVE", "INACTIVE", "PROSPECT"]),
  agentEmail: z.string().email("Valid email required"),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewClientDialog({ open, onOpenChange }: NewClientDialogProps) {
  const createCustomerMutation = useCreateCustomerMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      status: "PROSPECT",
      agentEmail: emailStorage.get() ?? "",
    },
  });

  const submitNewClientForm = async (formData: NewClientFormData) => {
    try {
      await createCustomerMutation.mutateAsync(formData);
      toast.success("Client created successfully");
      onOpenChange(false);
      reset({ status: "PROSPECT", agentEmail: emailStorage.get() ?? "" });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create client");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>Add a new client to your CRM.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submitNewClientForm)}
          className={styles.form}
        >
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                data-testid="firstName-input"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className={styles.fieldError}>{errors.firstName.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                data-testid="lastName-input"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className={styles.fieldError}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <Label htmlFor="nc-email">Email</Label>
            <Input
              id="nc-email"
              type="email"
              data-testid="email-input"
              {...register("email")}
            />
            {errors.email && (
              <p className={styles.fieldError}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label htmlFor="phone">Phone (05X-XXXXXXX)</Label>
              <Input
                id="phone"
                data-testid="phone-input"
                {...register("phone")}
                placeholder="050-1234567"
              />
              {errors.phone && (
                <p className={styles.fieldError}>{errors.phone.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <Label htmlFor="israeliId">Israeli ID</Label>
              <Input
                id="israeliId"
                data-testid="israeliId-input"
                {...register("israeliId")}
                placeholder="9 digits"
                maxLength={9}
              />
              {errors.israeliId && (
                <p className={styles.fieldError}>{errors.israeliId.message}</p>
              )}
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth && (
                <p className={styles.fieldError}>
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <Label>Status</Label>
              <Select
                defaultValue="PROSPECT"
                onValueChange={(selectedValue) =>
                  setValue(
                    "status",
                    selectedValue as "ACTIVE" | "INACTIVE" | "PROSPECT",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROSPECT">Prospect</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.field}>
            <Label htmlFor="agentEmail">Agent Email</Label>
            <Input id="agentEmail" type="email" {...register("agentEmail")} />
            {errors.agentEmail && (
              <p className={styles.fieldError}>{errors.agentEmail.message}</p>
            )}
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
              disabled={createCustomerMutation.isPending}
              data-testid="submit-button"
            >
              {createCustomerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
