"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs';

import { Button } from "@/components/ui/button";
import { Stepper, StepperItem, StepperStatusIcon, StepperTitle } from "@/components/ui/stepper";
import { FORM_STEPS } from "@/constants/supply-chain-form";
import { 
    formSchema, 
    FormData,
    SupplyChainInfoStep,
    LogisticsStep,
    RiskFactorsStep,
    CountrySelectionDialog
} from "./creation-form/index";

const steps = FORM_STEPS;

interface CreationFormProps {
  onSuccess: (data: FormData) => void;
  onCancel: () => void;
}

export default function CreationForm({ onSuccess, onCancel }: CreationFormProps) {
  const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(0));
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  
  // URL state for form data
  const [industryParam, setIndustryParam] = useQueryState('industry', parseAsString);
  const [customIndustryParam, setCustomIndustryParam] = useQueryState('customIndustry', parseAsString);
  const [productCharacteristicsParam, setProductCharacteristicsParam] = useQueryState('productCharacteristics', parseAsArrayOf(parseAsString));
  const [supplierTiersParam, setSupplierTiersParam] = useQueryState('supplierTiers', parseAsString);
  const [operationsLocationParam, setOperationsLocationParam] = useQueryState('operationsLocation', parseAsArrayOf(parseAsString));
  const [countryParam, setCountryParam] = useQueryState('country', parseAsString);
  const [currencyParam, setCurrencyParam] = useQueryState('currency', parseAsString);
  const [shippingMethodsParam, setShippingMethodsParam] = useQueryState('shippingMethods', parseAsArrayOf(parseAsString));
  const [annualVolumeTypeParam, setAnnualVolumeTypeParam] = useQueryState('annualVolumeType', parseAsString);
  const [annualVolumeValueParam, setAnnualVolumeValueParam] = useQueryState('annualVolumeValue', parseAsInteger);
  const [risksParam, setRisksParam] = useQueryState('risks', parseAsArrayOf(parseAsString));
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        productCharacteristics: productCharacteristicsParam || [],
        operationsLocation: operationsLocationParam || [],
        shippingMethods: shippingMethodsParam || [],
        risks: risksParam || [],
        annualVolumeType: (annualVolumeTypeParam as "units" | "currency") || "units",
        annualVolumeValue: annualVolumeValueParam || 0,
        industry: industryParam || "",
        customIndustry: customIndustryParam || "",
        supplierTiers: supplierTiersParam || "",
        country: countryParam || "",
        currency: currencyParam || "",
    }
  });

  const watchOperationsLocation = form.watch("operationsLocation");

  const handleNext = async () => {
    const fields = steps[step].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });

    if (!output) return;

    if (step === 0 && watchOperationsLocation.includes('domestic') && !form.getValues("country")) {
      setShowCountryDialog(true);
      return;
    }

    if (step < steps.length - 1) {
        setStep(step + 1);
    } else {
        form.handleSubmit(onSubmit)();
    }
  };

  const handleCountryNext = async () => {
    const countryValid = await form.trigger(["country"], { shouldFocus: true });
    
    if (countryValid) {
      setShowCountryDialog(false);
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    setStep(Math.max(step - 1, 0));
  };
  
  const onSubmit = (data: FormData) => {
    // Store all form data in URL parameters
    setIndustryParam(data.industry);
    setCustomIndustryParam(data.customIndustry || null);
    setProductCharacteristicsParam(data.productCharacteristics);
    setSupplierTiersParam(data.supplierTiers);
    setOperationsLocationParam(data.operationsLocation);
    setCountryParam(data.country || null);
    setCurrencyParam(data.currency);
    setShippingMethodsParam(data.shippingMethods);
    setAnnualVolumeTypeParam(data.annualVolumeType);
    setAnnualVolumeValueParam(data.annualVolumeValue);
    setRisksParam(data.risks);
    
    console.log('Form data stored in URL parameters:', data);
    
    onSuccess(data);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <SupplyChainInfoStep />;
      case 1:
        return <LogisticsStep />;
      case 2:
        return <RiskFactorsStep />;
      default:
        return null;
    }
  }

  return (
    <FormProvider {...form}>
      <motion.div
        layout
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut",
          layout: { duration: 0.3 }
        }}
      >
        <div className="px-6 pt-6 pb-4">
          <Stepper activeStep={step} className="max-w-xl mx-auto">
            {steps.map((stepItem, index) => (
              <StepperItem key={stepItem.name}>
                  <StepperStatusIcon status={
                      step > index ? 'success' : step === index ? 'loading' : 'inactive'
                  } />
                  <StepperTitle>{stepItem.name}</StepperTitle>
              </StepperItem>
            ))}
          </Stepper>
        </div>
          
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <motion.div 
                className="px-6 space-y-6"
                layout
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
            </motion.div>
        </form>
        
        <div className="flex items-center justify-between px-6 pb-6 pt-6">
          <Button onClick={
            () => {
                setStep(0);
                onCancel();
            }
        } variant="ghost">
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={handleBack} disabled={step === 0} variant="outline" className="disabled:cursor-not-allowed">
                Back
            </Button>
            <Button onClick={handleNext}>
                {step === steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </div>
        </div>
        </motion.div>

        <CountrySelectionDialog
            open={showCountryDialog}
            onOpenChange={setShowCountryDialog}
            onContinue={handleCountryNext}
        />
    </FormProvider>
  );
} 