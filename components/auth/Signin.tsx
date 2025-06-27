"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import {  loginWithEmailPassword ,signupWithEmailPassword, loginWithProvider, sendMagicLink } from "@/lib/functions/auth";
import { toast } from "@/hooks/use-toast";
import { AuthHeader } from "./auth-header";

const authSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type FormData = z.infer<typeof authSchema>;

const SigninPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<string>("email");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    
    try {
      let result;
      if (isSignUpMode) {
        result = await signupWithEmailPassword(values.email, values.password);
        if (result) {
          toast({
            title: "Account created successfully!",
            description: "Welcome to the platform.",
          });
          router.push("/dashboard");
        } else {
          toast({
            title: "Signup failed",
            description: "Email might already be in use or invalid.",
            variant: "destructive",
          });
        }
      } else {
        result = await loginWithEmailPassword(values.email, values.password);
        if (result) {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
          router.push("/dashboard");
        } else {
          toast({
            title: "Login failed",
            description: "Please check your credentials.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error(`${isSignUpMode ? 'Signup' : 'Signin'} error:`, error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "github") {
    setIsLoading(true);
    try {
      const result = await loginWithProvider(provider);
      if (result) {
        toast({
          title: "Welcome!",
          description: `Successfully signed in with ${provider}.`,
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Authentication failed",
          description: `Could not sign in with ${provider}. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: `Failed to sign in with ${provider}.`,
        variant: "destructive",
      });
      console.error(`${provider} login error:`, error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMagicLink() {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", {
        type: "manual",
        message: "Email is required for magic link",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendMagicLink(email);
      if (result) {
        toast({
          title: "Magic link sent!",
          description: `Check your inbox at ${email} for the sign-in link.`,
        });
      } else {
        toast({
          title: "Failed to send magic link",
          description: "Please try again or use a different authentication method.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
      console.error("Magic link error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    form.reset();
  };

  return (
    <>
      <AuthHeader />
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center overflow-hidden pt-16">
        {/* Background blurred elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-300 dark:bg-purple-900 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-blue-300 dark:bg-blue-900 opacity-20 blur-3xl"></div>

      <Card className="w-[400px] bg-secondary/50 backdrop-blur-md shadow-lg border border-gray-800 dark:border-slate-300">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {isSignUpMode ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUpMode 
              ? 'Join our resilience planning platform' 
              : 'Choose your preferred method to sign in'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" onValueChange={setAuthMethod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (isSignUpMode ? "Creating Account..." : "Signing in...") 
                      : (isSignUpMode ? "Create Account" : "Sign in")
                    }
                  </Button>
                </form>
              </Form>
              
              <div className="text-center mt-4">
                <button
                  onClick={toggleMode}
                  className="text-blue-500 hover:underline text-sm focus:outline-none"
                  disabled={isLoading}
                >
                  {isSignUpMode 
                    ? 'Already have an account? Sign In' 
                    : 'Don\'t have an account? Sign Up'
                  }
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="social">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700"
                  onClick={() => handleSocialLogin("github")}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Continue with GitHub
                </Button>
                <Separator />
                <p className="text-center text-sm text-muted-foreground">
                  Secure authentication with OAuth
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="magic">
              <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={handleMagicLink}
                    disabled={isLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? "Sending..." : "Send Magic Link"}
                  </Button>
                </form>
              </Form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                We'll send you a secure link to sign in instantly
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default SigninPage;