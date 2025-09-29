import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Eye, EyeOff } from "lucide-react";
import { registerSchema, type RegisterData, RELIGIONS, USER_TYPES } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      faith: "",
      location: "",
      userType: "seeker",
      faithPractice: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: (user) => {
      // Update auth cache
      queryClient.setQueryData(["/api/auth/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome to Beacon!",
        description: "Your account has been created successfully.",
      });
      
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to create account. Please try again.";
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const userType = form.watch("userType");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="sign-up-modal">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Join Beacon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            data-testid="button-close-modal"
            aria-label="Close sign up modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                {...form.register("firstName")}
                placeholder="Enter your first name"
                className="mt-1"
                data-testid="input-first-name"
                aria-describedby={form.formState.errors.firstName ? "firstName-error" : undefined}
              />
              {form.formState.errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                {...form.register("lastName")}
                placeholder="Enter your last name"
                className="mt-1"
                data-testid="input-last-name"
                aria-describedby={form.formState.errors.lastName ? "lastName-error" : undefined}
              />
              {form.formState.errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter your email address"
              className="mt-1"
              data-testid="input-email"
              aria-describedby={form.formState.errors.email ? "email-error" : undefined}
            />
            {form.formState.errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                placeholder="Create a password (min 6 characters)"
                className="pr-10"
                data-testid="input-password"
                aria-describedby={form.formState.errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                data-testid="button-toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Faith */}
          <div>
            <Label htmlFor="faith" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Faith Tradition
            </Label>
            <Select
              value={form.watch("faith")}
              onValueChange={(value) => form.setValue("faith", value)}
            >
              <SelectTrigger className="mt-1" data-testid="select-faith">
                <SelectValue placeholder="Select your faith tradition" />
              </SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((religion) => (
                  <SelectItem key={religion} value={religion}>
                    {religion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.faith && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.faith.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              {...form.register("location")}
              placeholder="City, State (e.g., San Francisco, CA)"
              className="mt-1"
              data-testid="input-location"
              aria-describedby={form.formState.errors.location ? "location-error" : undefined}
            />
            {form.formState.errors.location && (
              <p id="location-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          {/* User Type */}
          <div>
            <Label htmlFor="userType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              I am a...
            </Label>
            <Select
              value={form.watch("userType")}
              onValueChange={(value) => form.setValue("userType", value as "seeker" | "teacher")}
            >
              <SelectTrigger className="mt-1" data-testid="select-user-type">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {USER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.userType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.userType.message}
              </p>
            )}
          </div>

          {/* Faith Practice (conditional for teachers) */}
          {userType === "teacher" && (
            <div>
              <Label htmlFor="faithPractice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Faith Practice
              </Label>
              <Input
                id="faithPractice"
                type="text"
                {...form.register("faithPractice")}
                placeholder="e.g., Roman Catholic, Conservative Judaism, Sunni Islam"
                className="mt-1"
                data-testid="input-faith-practice"
                aria-describedby={form.formState.errors.faithPractice ? "faithPractice-error" : undefined}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tell us about your specific religious practice or denomination
              </p>
              {form.formState.errors.faithPractice && (
                <p id="faithPractice-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.faithPractice.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            disabled={registerMutation.isPending}
            data-testid="button-sign-up-submit"
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Error Display */}
          {registerMutation.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {(registerMutation.error as any)?.message || "An error occurred during registration"}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}