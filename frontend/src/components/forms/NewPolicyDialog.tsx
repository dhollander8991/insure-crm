import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import styles from "../forms.module.css";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast.success(t("policies.createSuccess", "Policy created successfully"));
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
      <DialogContent className={styles.npDialogContent}>
        <DialogHeader>
          <DialogTitle>{t("forms.newPolicy")}</DialogTitle>
          <DialogDescription>{t("forms.newPolicyDesc")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submitNewPolicyForm)}
          className={styles.npForm}
        >
          <div className={styles.npTwoCol}>
            <div className={styles.npField}>
              <Label htmlFor="customerId">{t("forms.customerId")}</Label>
              <Input
                id="customerId"
                type="number"
                data-testid="customerId-input"
                {...register("customerId")}
              />
              {errors.customerId && (
                <p className={styles.npFieldError}>{errors.customerId.message}</p>
              )}
            </div>
            <div className={styles.npField}>
              <Label htmlFor="customerName">{t("forms.customerName")}</Label>
              <Input
                id="customerName"
                data-testid="customerName-input"
                {...register("customerName")}
              />
              {errors.customerName && (
                <p className={styles.npFieldError}>
                  {errors.customerName.message}
                </p>
              )}
            </div>
          </div>

          <div className={styles.npTwoCol}>
            <div className={styles.npField}>
              <Label>{t("forms.type")}</Label>
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
                  <SelectItem value="CAR">{t("forms.typeCar")}</SelectItem>
                  <SelectItem value="APARTMENT">{t("forms.typeApartment")}</SelectItem>
                  <SelectItem value="LIFE">{t("forms.typeLife")}</SelectItem>
                  <SelectItem value="HEALTH">{t("forms.typeHealth")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={styles.npField}>
              <Label>{t("forms.status")}</Label>
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
                  <SelectItem value="PENDING">{t("forms.statusPending")}</SelectItem>
                  <SelectItem value="ACTIVE">{t("forms.statusActive")}</SelectItem>
                  <SelectItem value="CANCELLED">{t("forms.statusCancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.npTwoCol}>
            <div className={styles.npField}>
              <Label htmlFor="startDate">{t("forms.startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                data-testid="startDate-input"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className={styles.npFieldError}>{errors.startDate.message}</p>
              )}
            </div>
            <div className={styles.npField}>
              <Label htmlFor="endDate">{t("forms.endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                data-testid="endDate-input"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className={styles.npFieldError}>{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className={styles.npTwoCol}>
            <div className={styles.npField}>
              <Label htmlFor="premium">{t("forms.premium")}</Label>
              <Input
                id="premium"
                type="number"
                step="0.01"
                min="0.01"
                data-testid="premium-input"
                {...register("premium")}
              />
              {errors.premium && (
                <p className={styles.npFieldError}>{errors.premium.message}</p>
              )}
            </div>
            <div className={styles.npField}>
              <Label htmlFor="np-agentEmail">{t("forms.agentEmail")}</Label>
              <Input
                id="np-agentEmail"
                type="email"
                {...register("agentEmail")}
              />
              {errors.agentEmail && (
                <p className={styles.npFieldError}>{errors.agentEmail.message}</p>
              )}
            </div>
          </div>

          <div className={styles.npFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("forms.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createPolicyMutation.isPending}
              data-testid="submit-button"
            >
              {createPolicyMutation.isPending && (
                <Loader2 className={styles.npSpinner} />
              )}
              {t("forms.createPolicy")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
