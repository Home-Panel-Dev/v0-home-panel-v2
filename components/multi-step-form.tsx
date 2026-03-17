"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  enquiryFormSchema,
  transactionTypes,
  referralSources,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  type EnquiryFormData,
} from "@/lib/form-schema"

const steps = [
  { title: "Transaction", description: "What type of move?" },
  { title: "Your Details", description: "How can we reach you?" },
  { title: "Property", description: "Tell us about the property" },
  { title: "Referral", description: "How did you find us?" },
  { title: "Review", description: "Check your details" },
]

const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, enquiryFormSchema]

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      transactionType: "",
      fullName: "",
      email: "",
      phone: "",
      postcode: "",
      propertyPostcode: "",
      estimatedValue: "",
      mortgageRequired: "",
      firstTimeBuyer: "",
      referralSource: "",
    },
    mode: "onChange",
  })

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = form
  const watchedValues = watch()

  const validateCurrentStep = async () => {
    const schema = stepSchemas[currentStep]
    const fieldsToValidate = Object.keys(schema.shape) as (keyof EnquiryFormData)[]
    const isValid = await trigger(fieldsToValidate)
    return isValid
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.")
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="h-16 w-16 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-semibold mb-3">Enquiry submitted</h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Thank you for your enquiry. A member of the HomePanel team will be in touch shortly to guide you through the next steps.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStep
                    ? "bg-foreground text-background"
                    : index === currentStep
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block h-0.5 w-8 lg:w-16 mx-2 transition-colors ${
                    index < currentStep ? "bg-foreground" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{steps[currentStep].title}</h2>
          <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <Step1TransactionType
                value={watchedValues.transactionType}
                onChange={(value) => setValue("transactionType", value)}
                error={errors.transactionType?.message}
              />
            )}

            {currentStep === 1 && (
              <Step2BasicDetails
                register={register}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <Step3PropertyDetails
                register={register}
                values={watchedValues}
                setValue={setValue}
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <Step4ReferralSource
                value={watchedValues.referralSource}
                onChange={(value) => setValue("referralSource", value)}
                error={errors.referralSource?.message}
              />
            )}

            {currentStep === 4 && (
              <Step5Review values={watchedValues} />
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-full"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit enquiry
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

// Step 1: Transaction Type
function Step1TransactionType({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">What type of transaction is this?</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid gap-3"
      >
        {transactionTypes.map((type) => (
          <label
            key={type.value}
            className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${
              value === type.value
                ? "border-foreground bg-secondary"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <RadioGroupItem value={type.value} className="sr-only" />
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-4 ${
                value === type.value ? "border-foreground" : "border-muted-foreground/50"
              }`}
            >
              {value === type.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
              )}
            </div>
            <span className="font-medium">{type.label}</span>
          </label>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// Step 2: Basic Details
function Step2BasicDetails({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<EnquiryFormData>>["register"]
  errors: ReturnType<typeof useForm<EnquiryFormData>>["formState"]["errors"]
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          placeholder="John Smith"
          {...register("fullName")}
          className="h-12 rounded-xl"
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register("email")}
          className="h-12 rounded-xl"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="07700 900000"
          {...register("phone")}
          className="h-12 rounded-xl"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="postcode">Your postcode</Label>
        <Input
          id="postcode"
          placeholder="SW1A 1AA"
          {...register("postcode")}
          className="h-12 rounded-xl"
        />
        {errors.postcode && (
          <p className="text-sm text-destructive">{errors.postcode.message}</p>
        )}
      </div>
    </div>
  )
}

// Step 3: Property Details
function Step3PropertyDetails({
  register,
  values,
  setValue,
  errors,
}: {
  register: ReturnType<typeof useForm<EnquiryFormData>>["register"]
  values: EnquiryFormData
  setValue: ReturnType<typeof useForm<EnquiryFormData>>["setValue"]
  errors: ReturnType<typeof useForm<EnquiryFormData>>["formState"]["errors"]
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="propertyPostcode">Property postcode</Label>
        <Input
          id="propertyPostcode"
          placeholder="SW1A 1AA"
          {...register("propertyPostcode")}
          className="h-12 rounded-xl"
        />
        {errors.propertyPostcode && (
          <p className="text-sm text-destructive">{errors.propertyPostcode.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimatedValue">Estimated property value</Label>
        <Input
          id="estimatedValue"
          placeholder="£350,000"
          {...register("estimatedValue")}
          className="h-12 rounded-xl"
        />
        {errors.estimatedValue && (
          <p className="text-sm text-destructive">{errors.estimatedValue.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Will you need a mortgage?</Label>
        <RadioGroup
          value={values.mortgageRequired}
          onValueChange={(value) => setValue("mortgageRequired", value)}
          className="flex gap-4"
        >
          {["yes", "no"].map((option) => (
            <label
              key={option}
              className={`flex-1 flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-colors ${
                values.mortgageRequired === option
                  ? "border-foreground bg-secondary"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <RadioGroupItem value={option} className="sr-only" />
              <span className="font-medium capitalize">{option}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.mortgageRequired && (
          <p className="text-sm text-destructive">{errors.mortgageRequired.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Are you a first-time buyer?</Label>
        <RadioGroup
          value={values.firstTimeBuyer}
          onValueChange={(value) => setValue("firstTimeBuyer", value)}
          className="flex gap-4"
        >
          {["yes", "no"].map((option) => (
            <label
              key={option}
              className={`flex-1 flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-colors ${
                values.firstTimeBuyer === option
                  ? "border-foreground bg-secondary"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <RadioGroupItem value={option} className="sr-only" />
              <span className="font-medium capitalize">{option}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.firstTimeBuyer && (
          <p className="text-sm text-destructive">{errors.firstTimeBuyer.message}</p>
        )}
      </div>
    </div>
  )
}

// Step 4: Referral Source
function Step4ReferralSource({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">How did you hear about HomePanel?</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid gap-3"
      >
        {referralSources.map((source) => (
          <label
            key={source.value}
            className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${
              value === source.value
                ? "border-foreground bg-secondary"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <RadioGroupItem value={source.value} className="sr-only" />
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-4 ${
                value === source.value ? "border-foreground" : "border-muted-foreground/50"
              }`}
            >
              {value === source.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
              )}
            </div>
            <span className="font-medium">{source.label}</span>
          </label>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// Step 5: Review
function Step5Review({ values }: { values: EnquiryFormData }) {
  const transactionLabel = transactionTypes.find((t) => t.value === values.transactionType)?.label
  const referralLabel = referralSources.find((r) => r.value === values.referralSource)?.label

  const reviewItems = [
    { label: "Transaction type", value: transactionLabel },
    { label: "Name", value: values.fullName },
    { label: "Email", value: values.email },
    { label: "Phone", value: values.phone },
    { label: "Your postcode", value: values.postcode },
    { label: "Property postcode", value: values.propertyPostcode },
    { label: "Estimated value", value: values.estimatedValue },
    { label: "Mortgage required", value: values.mortgageRequired === "yes" ? "Yes" : "No" },
    { label: "First-time buyer", value: values.firstTimeBuyer === "yes" ? "Yes" : "No" },
    { label: "How you found us", value: referralLabel },
  ]

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground mb-6">
        Please review your details below before submitting your enquiry.
      </p>
      <div className="rounded-2xl border border-border overflow-hidden">
        {reviewItems.map((item, index) => (
          <div
            key={item.label}
            className={`flex justify-between p-4 ${
              index !== reviewItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
