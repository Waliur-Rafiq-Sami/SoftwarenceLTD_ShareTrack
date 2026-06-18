"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signInSchema } from "@/schemas/signInSchema";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/lib/toast-service";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        if (
          result.error === "CredentialsSignin" ||
          result.error === "Incorrect password"
        ) {
          toast.error({
            title: "Unable to sign in",
            description: "Please check your email/username and password.",
          });
        } else {
          toast.error({
            title: "Something went wrong",
            description: "Please try again in a moment.",
          });
        }

        return;
      }

      if (result?.url) {
        toast.success({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });

        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 px-8 py-10 shadow-2xl shadow-black/15 backdrop-blur-xl transition-colors duration-300">
        <div className="absolute left-6 top-4 z-20">
          <Link
            href="/"
            className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary shadow-[0_0_1rem_-0.25rem_rgba(59,130,246,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_1.5rem_-0.25rem_rgba(59,130,246,0.4)] active:scale-95 active:border-primary/50 active:bg-primary/20 sm:px-4 sm:hover:scale-105"
          >
            {/* Continuous slow pulsing background to catch the eye instantly */}
            <span className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-transparent via-primary/5 to-transparent" />

            {/* Shimmer sweep effect (Triggers on hover for desktop, tap for mobile) */}
            <span className="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-primary/20 to-transparent transition-transform duration-500 group-hover:translate-x-[100%] group-active:translate-x-[100%]" />

            {/* Arrow Container - Distinct initial tinted style */}
            <div className="flex items-center justify-center rounded-full bg-primary/10 p-1 shadow-sm ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:ring-primary/40 group-active:bg-primary/30">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
            </div>
            <span>Home</span>
          </Link>
        </div>
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <div className="space-y-4 pb-6 border-b border-border/50 pt-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Softwarence LTD
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Welcome back to Share
            <span className="text-blue-500">Track</span>
          </h1>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            Professional enterprise-grade share Track for modern Share
            operations. Log in securely and continue where you left off.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="Username or email"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{" "}
            <Link
              href="/sign-up"
              className="text-primary hover:text-primary/80 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
