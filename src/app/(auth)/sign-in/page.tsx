"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

        router.replace("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 px-8 py-10 shadow-2xl shadow-black/15 backdrop-blur-xl transition-colors duration-300">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <div className="space-y-4 pb-6 border-b border-border/50">
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
