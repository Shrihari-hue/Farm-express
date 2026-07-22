import type { LabourType } from "@constants/config";
import type { BankDetails } from "@types/models";

export interface WorkerFormValues {
  type: LabourType;
  name: string;
  phone: string;
  address: string;
  village: string;
  joiningDate: string | null;
  monthlySalary: string; // kept as string in the form, parsed to number on submit
  dailyWage: string;
  bankDetails: BankDetails;
  notes: string;
  /** Local `file://` URI if the user just picked a new photo, or an
   * existing `https://` URL, or null for no photo. */
  photoUri: string | null;
}

export const EMPTY_WORKER_FORM: WorkerFormValues = {
  type: "casual",
  name: "",
  phone: "",
  address: "",
  village: "",
  joiningDate: null,
  monthlySalary: "",
  dailyWage: "",
  bankDetails: {},
  notes: "",
  photoUri: null,
};
