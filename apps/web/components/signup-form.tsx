 'use client'
 import { Github } from "lucide-react"; 

 import {useRouter} from "next/navigation"

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { trpc } from "~/trpc/client";

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {   

  const[values, setValues] = useState({  

    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    
  })   
  const [errors, setErrors] = useState<Record<string, string>>({})
  const[submitted, setSubmitted] = useState(false)  
  const utils = trpc.useUtils() 
  const router = useRouter()
   

  function set(field: keyof typeof values) {
    return  (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({...v, [field]: e.target.value}))
  }  

  // setValues((v)=> ()) ye jo andar v hai iska matlab hai ki jo existing values hai unko le lete hai  

  function validate(v: typeof values) {

    const e: Record<string, string> = {}
    if (!v.fullName.trim()) {
      // add validation error handling here
      e.fullName = "Name is required"
    } 
     if (!v.email.trim()) {
      // add validation error handling here
      e.email = "email is required"
    }
     if (!v.password.trim()) {
      // add validation error handling here
      e.password = "password is required"
    }
     if (!v.confirmPassword.trim()) {
      // add validation error handling here
      e.confirmPassword = "Password do not matched"
    }

    return e
  }

  const createUserWithEmailAndPassword = trpc.auth.createUserwithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate()
      setSubmitted(true) 
       router.replace("/dashboard")
    },
    onError: (error) => {
      setSubmitted(false)
      setErrors((currentErrors) => ({ ...currentErrors, root: error.message }))
    },
  })

  function submit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault()
    const e = validate(values) 
    setErrors(e)
    if (Object.keys(e).length === 0) setSubmitted(true)
    if (Object.keys(e).length === 0) {
      createUserWithEmailAndPassword.mutate({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      })
    }

  } 

  



  return (
    <form onSubmit = {submit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup className="gap-5">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Start for free
          </p>
          <h1 className="text-3xl font-semibold tracking-normal text-zinc-50 sm:text-4xl">
            Create your FormOra account
          </h1>
          <p className="max-w-[36rem] text-sm leading-6 text-zinc-400">
            Build conversational forms, collect responses, and launch without friction.
          </p>
        </div>
        <Field className="gap-2">
          <FieldLabel htmlFor="name" className="text-zinc-200">
            Full name
          </FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="John Doe" 
            value={values.fullName}
            onChange={set('fullName')}
            required
            className="h-12 border-white/10 bg-white/[0.055] px-4 text-zinc-50 shadow-none placeholder:text-zinc-500 focus-visible:border-violet-400/70 focus-visible:ring-violet-400/20"
          /> 
          {errors.fullName && <span> full name is required </span>}
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="email" className="text-zinc-200">
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com" 
            value={values.email}
            onChange={set('email')}
            required
            className="h-12 border-white/10 bg-white/[0.055] px-4 text-zinc-50 shadow-none placeholder:text-zinc-500 focus-visible:border-violet-400/70 focus-visible:ring-violet-400/20"
          />
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="password" className="text-zinc-200">
            Password
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password" 
            value={values.password}
            onChange={set('password')}
            required
            className="h-12 border-white/10 bg-white/[0.055] px-4 text-zinc-50 shadow-none placeholder:text-zinc-500 focus-visible:border-violet-400/70 focus-visible:ring-violet-400/20"
          />
          <FieldDescription className="text-xs text-zinc-500">
            Use at least 8 characters.
          </FieldDescription>
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="confirm-password" className="text-zinc-200">
            Confirm password
          </FieldLabel>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password" 
            value={values.confirmPassword}
            onChange={set('confirmPassword')}
            required
            className="h-12 border-white/10 bg-white/[0.055] px-4 text-zinc-50 shadow-none placeholder:text-zinc-500 focus-visible:border-violet-400/70 focus-visible:ring-violet-400/20"
          />
        </Field>
        {errors.root && <span className="text-sm text-red-300">{errors.root}</span>}
        {submitted && createUserWithEmailAndPassword.isSuccess && (
          <span className="text-sm text-emerald-300">Account created successfully</span>
        )}
        <Field>
          <Button
            type="submit"
            className="h-12 bg-zinc-50 text-zinc-950 shadow-lg shadow-black/20 hover:bg-white"
          >
            Create account
          </Button>
        </Field>
        <FieldSeparator className="text-zinc-500 [&_[data-slot=separator]]:bg-white/10 [&_[data-slot=field-separator-content]]:bg-[#08090d]">
          Or continue with
        </FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            className="h-12 border-white/10 bg-white/[0.035] text-zinc-100 shadow-none hover:bg-white/[0.08] hover:text-white"
          >
            <Github className="size-4" />
            Sign up with GitHub
          </Button>
          <FieldDescription className="px-6 text-center text-zinc-500 [&_a]:text-zinc-200 [&_a:hover]:text-violet-300">
            Already have an account? <a href="login">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
  
