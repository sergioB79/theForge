"use client";

import { FormEvent } from "react";

type IntakeFormProps = {
  action: string;
  children: React.ReactNode;
  className?: string;
};

export default function IntakeForm({ action, children, className }: IntakeFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    setTimeout(() => form.reset(), 0);
  };

  return (
    <form
      className={className}
      action={action}
      method="post"
      target="_blank"
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}
