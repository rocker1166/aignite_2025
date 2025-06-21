"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Stepper, StepperItem, StepperStatusIcon, StepperTitle } from "@/components/ui/stepper";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multiselect";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { CurrencySelect } from "@/components/ui/currency-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";
import {
  INDUSTRIES,
  PRODUCT_CHARACTERISTICS,
  SUPPLIER_TIERS,
  OPERATIONS_LOCATIONS,
  SHIPPING_METHODS,
  RISK_FACTORS,
  SUPPLIER_TIER_INFO,
  ANNUAL_VOLUME_TYPES,
  FORM_STEPS
} from "@/constants/supply-chain-form";

const formSchema = z.object({
    industry: z.string().min(1, "Industry is required."),
    customIndustry: z.string().optional(),
    productCharacteristics: z.array(z.string()).min(1, "At least one characteristic must be selected."),
    supplierTiers: z.string().min(1, "Supplier tier is required."),
    operationsLocation: z.array(z.string()).min(1, "At least one location must be selected."),
    country: z.string().optional(),
    currency: z.string().min(1, "Currency is required."),
    shippingMethods: z.array(z.string()).min(1, "At least one shipping method must be selected."),
    annualVolumeType: z.enum(["units", "currency"]),
    annualVolumeValue: z.number().positive("Annual volume must be a positive number."),
    risks: z.array(z.string()).min(1, "At least one risk must be selected."),
}).refine(data => {
    if (data.industry === 'Other') {
        return !!data.customIndustry && data.customIndustry.length > 0;
    }
    return true;
}, {
    message: "Please specify the industry",
    path: ["customIndustry"],
}).refine(data => {
    if (data.operationsLocation.includes('domestic')) {
        return !!data.country && data.country.length > 0;
    }
    return true;
}, {
    message: "Please select a country for domestic operations",
    path: ["country"],
});

type FormData = z.infer<typeof formSchema>;

const steps = FORM_STEPS;

export default function TestingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        productCharacteristics: [],
        operationsLocation: [],
        shippingMethods: [],
        risks: [],
        annualVolumeType: "units",
        annualVolumeValue: 0,
    }
  });

  const watchIndustry = form.watch("industry");
  const watchOperationsLocation = form.watch("operationsLocation");

  const handleNext = async () => {
    const fields = steps[activeStep].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });

    if (!output) return;

    // Check if domestic only is selected and we're on the first step
    if (activeStep === 0 && watchOperationsLocation.includes('domestic')) {
      setShowCountryDialog(true);
      return;
    }

    if (activeStep < steps.length - 1) {
        setActiveStep((prev) => prev + 1);
    } else {
        // Submit
        form.handleSubmit(onSubmit)();
    }
  };

  const handleCountryNext = async () => {
    const countryValid = await form.trigger(["country"], { shouldFocus: true });
    
    if (countryValid) {
      setShowCountryDialog(false);
      if (activeStep < steps.length - 1) {
        setActiveStep((prev) => prev + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    alert(JSON.stringify(data, null, 2));
    // You can close the dialog and show a success message here
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Start Supply Chain Onboarding</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <motion.div
            layout
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut",
              layout: { duration: 0.3 }
            }}
          >
          <DialogHeader>
            <DialogTitle>Supply Chain Information</DialogTitle>
            <DialogDescription>
              Please fill out the following information about your supply chain.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pt-6 pb-4">
            <Stepper activeStep={activeStep}>
              {steps.map((step, index) => (
                <StepperItem key={step.name}>
                    <StepperStatusIcon status={
                        activeStep > index ? 'success' : activeStep === index ? 'loading' : 'inactive'
                    } />
                    <StepperTitle>{step.name}</StepperTitle>
                </StepperItem>
              ))}
            </Stepper>
          </div>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <motion.div 
                        className="px-6 space-y-6"
                        layout
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <AnimatePresence mode="wait">
                            {activeStep === 0 && (
                                <motion.div 
                                    key="step-0"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="space-y-6"
                                >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="industry"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Industry</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select an industry" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {INDUSTRIES.map((industry) => (
                                                            <SelectItem key={industry.value} value={industry.value}>
                                                                {industry.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                        {watchIndustry === 'Other' && (
                                        <FormField
                                            control={form.control}
                                            name="customIndustry"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Please Specify</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your custom industry" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="productCharacteristics"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Product Characteristics</FormLabel>
                                                <MultiSelect
                                                    options={PRODUCT_CHARACTERISTICS}
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    placeholder="Select characteristics..."
                                                />
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <FormField
                                        control={form.control}
                                        name="supplierTiers"
                                        render={({ field }) => (
                                            <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormLabel>Supplier Tiers</FormLabel>
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                                    </HoverCardTrigger>
                                                    <HoverCardContent 
                                                        className="w-80 p-4" 
                                                        side="top" 
                                                        align="start"
                                                        sideOffset={5}
                                                    >
                                                        <div className="space-y-2">
                                                            <p className="font-medium">{SUPPLIER_TIER_INFO.title}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {SUPPLIER_TIER_INFO.description}
                                                            </p>
                                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                                {SUPPLIER_TIER_INFO.tiers.map((tier, index) => (
                                                                    <li key={index}>
                                                                        <strong>{tier.level}</strong> {tier.description}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </div>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supplier tiers" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {SUPPLIER_TIERS.map((tier) => (
                                                        <SelectItem key={tier.value} value={tier.value}>
                                                            {tier.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="operationsLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Operations Location</FormLabel>
                                            <MultiSelect
                                                options={OPERATIONS_LOCATIONS}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                placeholder="Select locations..."
                                            />
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                </motion.div>
                            )}
                            {activeStep === 1 && (
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
                                            value={field.value || ''} 
                                            onChange={e => {
                                                const value = e.target.value;
                                                field.onChange(value === '' ? 0 : parseInt(value, 10) || 0);
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
                                            value={field.value || ''} 
                                            onChange={e => {
                                                const value = e.target.value;
                                                field.onChange(value === '' ? 0 : parseInt(value, 10) || 0);
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
                            )}
                            {activeStep === 2 && (
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
                                        <FormLabel className="text-base font-medium">Risk Factors</FormLabel>
                                        <FormDescription>
                                            Select the risk factors that are most relevant to your supply chain operations
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
                            )}
                        </AnimatePresence>
                    </motion.div>
                </form>
            </FormProvider>
          

          <DialogFooter className="px-6 pb-6 pt-10">
            <Button onClick={handleBack} disabled={activeStep === 0} variant="outline" className="disabled:cursor-not-allowed">
              Back
            </Button>
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Country Selection Dialog */}
      <Dialog open={showCountryDialog} onOpenChange={setShowCountryDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <DialogHeader>
              <DialogTitle>Select Your Country</DialogTitle>
              <DialogDescription>
                Since you selected domestic operations, please specify your country.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
            <FormProvider {...form}>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <CountryDropdown
                      onChange={(country) => field.onChange(country.alpha3)}
                      defaultValue={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormProvider>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setShowCountryDialog(false)} 
                variant="outline"
              >
                Back
              </Button>
              <Button onClick={handleCountryNext}>
                Continue
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 