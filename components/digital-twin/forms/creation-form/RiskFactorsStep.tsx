"use client"

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multiselect";
import { RISK_FACTORS } from "@/constants/supply-chain-form";
import { FormData } from "./form-schema";

export const RiskFactorsStep = () => {
  const form = useFormContext<FormData>();

  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6"
    >
      <FormField
        control={form.control}
        name="risks"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Risk Factors
            </FormLabel>
            <FormDescription>
              Select the risk factors that are most relevant to your supply
              chain operations
            </FormDescription>
            <MultiSelect
              options={RISK_FACTORS}
              onValueChange={field.onChange}
              defaultValue={field.value}
              placeholder="Select risks..."
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}; 