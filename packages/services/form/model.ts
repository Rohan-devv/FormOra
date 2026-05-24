import { z } from "zod"

export const createFormInput = z.object({
  title: z.string().min(1).max(50).describe("title of the form"),
  description: z.string().max(150).optional().nullable().describe("description of the form"),
  createdBy: z.uuid().describe("uuid of the user creating the form"),
})

export type CreateFormInputType = z.infer<typeof createFormInput>
