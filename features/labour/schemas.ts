import { z } from "zod";
import { nonEmptyString } from "@utils/validation";

/**
 * One schema for both worker types, with `superRefine` enforcing the
 * fields that only make sense for one type (monthly salary for permanent,
 * daily wage for casual) — this matches how `WorkerForm` renders every
 * field in one component and just shows/hides sections based on `type`,
 * rather than swapping between two separate forms.
 */
export const workerFormSchema = z
  .object({
    type: z.enum(["permanent", "casual"]),
    name: nonEmptyString("Name"),
    phone: z.string().trim().regex(/^$|^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    address: z.string().trim(),
    village: z.string().trim(),
    joiningDate: z.string().nullable(),
    monthlySalary: z.string().trim(),
    dailyWage: z.string().trim(),
    bankDetails: z.object({
      accountHolder: z.string().trim().optional(),
      accountNumber: z.string().trim().optional(),
      ifsc: z.string().trim().optional(),
      bankName: z.string().trim().optional(),
      branch: z.string().trim().optional(),
    }),
    notes: z.string().trim(),
    photoUri: z.string().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "permanent") {
      const salary = Number(values.monthlySalary);
      if (!values.monthlySalary || Number.isNaN(salary) || salary <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monthlySalary"],
          message: "Enter the monthly salary",
        });
      }
    } else {
      const wage = Number(values.dailyWage);
      if (!values.dailyWage || Number.isNaN(wage) || wage <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dailyWage"],
          message: "Enter the daily wage",
        });
      }
    }
  });

export type WorkerFormSchema = z.infer<typeof workerFormSchema>;
