 'use client'
 
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button" 
import {useRouter} from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useState } from "react"
import { trpc } from "~/trpc/client"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {  

  const [values, setValues] = useState({
    email : "",
    password: ""
  }) 

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const utils = trpc.useUtils() 
  const router = useRouter()
 


  function set(fields: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({...v, [fields] : e.target.value}))
  }   

  function validate (v : typeof values) {
    const e: Record<string, string> = {}   

    if(!v.email.trim()) e.email = "email is required" 
    if(!v.password.trim()) e.password = "password is required" 

    return e 

  }   

  const signInUserWithEmailAndPassword = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate()//Purana user data hatao / stale karo, ab server se fresh logged-in user lao.
      setSubmitted(true) 
      router.replace("/dashboard")
    },
    onError: (error) => {
      setSubmitted(false)
      setErrors((currentErrors) => ({ ...currentErrors, root: error.message }))
    },
  })

  function submit (event: React.FormEvent<HTMLFormElement>) {  
    event.preventDefault() 
    const e = validate(values) 
    setErrors(e)
    if(Object.keys(e).length === 0) {
      signInUserWithEmailAndPassword.mutate({
        email: values.email.trim(),
        password: values.password,
      })
    }


  }




  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={values.email}
                  onChange={set("email")}
                  required
                />
                {errors.email && <span>{errors.email}</span>}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={set("password")}
                  required
                />
                {errors.password && <span>{errors.password}</span>}
              </Field>
              {errors.root && <span>{errors.root}</span>}
              {submitted && signInUserWithEmailAndPassword.isSuccess && (
                <span>Login successfully</span>
              )}
              <Field>
                <Button type="submit">Login</Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/signup">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
