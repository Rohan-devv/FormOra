import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().min(1).max(50).describe("title of the form"),
  description: z.string().max(150).optional().nullable().describe("description of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("id of the created form"),
});

export const listFormsByUserIdOutputModel = z.array(
  z.object({
    id: z.string().describe("id of the created form"),
    title: z.string().describe("title of form"),
    description: z.string().nullable().optional().describe("Description of form"),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().describe("Last updated timestamp"),
  }),
);

const fieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const getPublicFormInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the publicly shared form"),
});

export const getPublicFormOutputModel = z.object({
  id: z.string().describe("id of the shared form"),
  title: z.string().describe("title of the shared form"),
  description: z.string().nullable().describe("description of the shared form"),
  fields: z.array(
    z.object({
      id: z.string().describe("id of the field"),
      label: z.string().describe("display label of the field"),
      labelKey: z.string().describe("stable key generated from the field label"),
      description: z.string().nullable().describe("helper text shown below the field"),
      placeholder: z.string().nullable().describe("placeholder text of the field"),
      isRequired: z.boolean().describe("whether the field is required or not"),
      index: z.string().describe("field position inside the form"),
      type: fieldTypeEnum.describe("type of the field"),
    }),
  ),
});

export const createFieldInputModel = z.object({
  label: z.string().max(100).describe("Display label of the field"),
  description: z.string().max(100).optional().describe("helper text shown below the field"),
  type: fieldTypeEnum.describe("Type of the field"),
  placeholder: z.string().max(50).optional().describe("placeholder text of the field"),
  isRequired: z
    .boolean()
    .optional()
    .default(false)
    .describe("whether the field is required or not"),
  formId: z.string().uuid().describe("UUID of the form this field belongs to"),
});

export const createFieldOutputModel = z.object({
  id: z.string().describe("id of the created field"),
  labelKey: z.string().describe("stable key generated from the field label"),
  index: z.string().describe("field position inside the form"),
});

export const updateFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("field id we want to update"),
  label: z.string().max(100).describe("Updated display label"),
  type: fieldTypeEnum.optional().describe("Updated type of the field"),
  description: z.string().max(100).optional().nullable().describe("Updated helper text"),
  placeholder: z.string().max(50).optional().nullable().describe("Updated placeholder text"),
  isRequired: z.boolean().optional().default(false).describe("Updated required flag"),
});

export const updateFieldOutputModel = z.object({
  id: z.string().describe("id of the updated field"),
});

export const deleteFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("UUID of field id to delete"),
});

export const deleteFieldOutputModel = z.object({
  id: z.string().describe("id of the deleted field"),
});

export const getFieldsInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form to fetch fields for"),
});

export const getFieldsOutputModel = z.array(
  z.object({
    id: z.string().describe("id of the field"),
    label: z.string().describe("Display label of the field"),
    labelKey: z.string().describe("stable key generated from the field label"),
    description: z.string().nullable().describe("helper text shown below the field"),
    placeholder: z.string().nullable().describe("placeholder text of the field"),
    isRequired: z.boolean().describe("whether the field is required or not"),
    index: z.string().describe("field position inside the form"),
    type: fieldTypeEnum.describe("Type of the field"),
    formId: z.string().nullable().describe("UUID of the form this field belongs to"),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().describe("Last updated timestamp"),
  }),
);
