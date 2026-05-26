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
import { useCreateCustomerMutation } from "@/lib/queries/customers.queries";

const newClientSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^05\d{8}$/, "Format: 05XXXXXXXX (10 digits, no hyphen)"),
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
  const { t } = useTranslation();
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
      toast.success(t("customers.createSuccess", "Client created successfully"));
      onOpenChange(false);
      reset({ status: "PROSPECT", agentEmail: emailStorage.get() ?? "" });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create client");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.ncDialogContent}>
        <DialogHeader>
          <DialogTitle>{t("forms.newClient")}</DialogTitle>
          <DialogDescription>{t("forms.newClientDesc")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submitNewClientForm)}
          className={styles.ncForm}
        >
          <div className={styles.ncTwoCol}>
            <div className={styles.ncField}>
              <Label htmlFor="firstName">{t("forms.firstName")}</Label>
              <Input
                id="firstName"
                data-testid="firstName-input"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className={styles.ncFieldError}>{errors.firstName.message}</p>
              )}
            </div>
            <div className={styles.ncField}>
              <Label htmlFor="lastName">{t("forms.lastName")}</Label>
              <Input
                id="lastName"
                data-testid="lastName-input"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className={styles.ncFieldError}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className={styles.ncField}>
            <Label htmlFor="nc-email">{t("common.email")}</Label>
            <Input
              id="nc-email"
              type="email"
              data-testid="email-input"
              {...register("email")}
            />
            {errors.email && (
              <p className={styles.ncFieldError}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.ncTwoCol}>
            <div className={styles.ncField}>
              <Label htmlFor="phone">{t("forms.phoneFormat")}</Label>
              <Input
                id="phone"
                data-testid="phone-input"
                {...register("phone")}
                placeholder="0501234567"
              />
              {errors.phone && (
                <p className={styles.ncFieldError}>{errors.phone.message}</p>
              )}
            </div>
            <div className={styles.ncField}>
              <Label htmlFor="israeliId">{t("forms.israeliId")}</Label>
              <Input
                id="israeliId"
                data-testid="israeliId-input"
                {...register("israeliId")}
                placeholder={t("forms.nineDigits")}
                maxLength={9}
              />
              {errors.israeliId && (
                <p className={styles.ncFieldError}>{errors.israeliId.message}</p>
              )}
            </div>
          </div>

          <div className={styles.ncTwoCol}>
            <div className={styles.ncField}>
              <Label htmlFor="dateOfBirth">{t("customers.dateOfBirth")}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth && (
                <p className={styles.ncFieldError}>
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className={styles.ncField}>
              <Label>{t("forms.status")}</Label>
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
                  <SelectItem value="PROSPECT">{t("forms.statusProspect")}</SelectItem>
                  <SelectItem value="ACTIVE">{t("forms.statusActive")}</SelectItem>
                  <SelectItem value="INACTIVE">{t("forms.statusInactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.ncField}>
            <Label htmlFor="agentEmail">{t("forms.agentEmail")}</Label>
            <Input id="agentEmail" type="email" {...register("agentEmail")} />
            {errors.agentEmail && (
              <p className={styles.ncFieldError}>{errors.agentEmail.message}</p>
            )}
          </div>

          <div className={styles.ncFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("forms.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createCustomerMutation.isPending}
              data-testid="submit-button"
            >
              {createCustomerMutation.isPending && (
                <Loader2 className={styles.ncSpinner} />
              )}
              {t("forms.createClient")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
