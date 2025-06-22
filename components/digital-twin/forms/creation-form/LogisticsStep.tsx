"use client"

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import { CurrencySelect } from "@/components/ui/currency-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SHIPPING_METHODS,
  ANNUAL_VOLUME_TYPES,
} from "@/constants/supply-chain-form";
import { FormData } from "./form-schema";

export const LogisticsStep = () => {
  const form = useFormContext<FormData>();

  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <CurrencySelect {...field} onValueChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shippingMethods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Methods</FormLabel>
              <MultiSelect
                options={SHIPPING_METHODS}
                onValueChange={field.onChange}
                defaultValue={field.value}
                placeholder="Select methods..."
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="w-full">
        <FormLabel className="text-base font-medium">Annual Volume</FormLabel>
        <Tabs defaultValue="units" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            {ANNUAL_VOLUME_TYPES.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="units" className="mt-4">
            <FormField
              control={form.control}
              name="annualVolumeValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Volume (Units)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 10,000"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? 0 : parseInt(value, 10) || 0
                        );
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the total number of units you handle annually
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="currency" className="mt-4">
            <FormField
              control={form.control}
              name="annualVolumeValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Volume (Currency)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 500,000"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? 0 : parseInt(value, 10) || 0
                        );
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your total annual revenue in your selected currency
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}; 