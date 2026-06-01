import { z } from "zod"

export const createFormInput = z.object({
  title: z.string().min(1).max(50).describe("title of the form"),
  description: z.string().max(150).optional().nullable().describe("description of the form"),
  createdBy: z.uuid().describe("uuid of the user creating the form"),
})

export type CreateFormInputType = z.infer<typeof createFormInput> 

export const listFormsByUserIdInput = z.object({
 userId: z.string().describe('uuid of the user')
}) 

export type ListallFormsInputType = z.infer<typeof listFormsByUserIdInput> 

export const getPublicFormByIdInput = z.object({
  formId: z.string().uuid().describe("uuid of the publicly shared form"),
})

export type GetPublicFormByIdInputType = z.infer<typeof getPublicFormByIdInput>
