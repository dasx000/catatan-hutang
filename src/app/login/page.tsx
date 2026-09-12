"use client";

import { useActionState } from "react";
import { NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { masuk, type AuthState } from "./actions";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(masuk, initialState);

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-[22rem]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-clay">
            <NotebookText className="size-[24px]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Catatan Hutang</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Masuk untuk lihat siapa saja yang masih berhutang.
            </p>
          </div>
        </div>

        <form
          action={formAction}
          className="rounded-3xl border-2 border-foreground/5 bg-card p-5 shadow-clay-lg dark:border-white/10"
        >
          <FieldGroup>
            <Field data-invalid={!!state.error}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={!!state.error}
              />
            </Field>
            <Field data-invalid={!!state.error}>
              <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                aria-invalid={!!state.error}
              />
              {state.error && <FieldError>{state.error}</FieldError>}
            </Field>
            <Field>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Memproses..." : "Masuk"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
