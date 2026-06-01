import z from "zod"; 

const fieldTypeEnum = z.enum(['TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD'])

export const createFieldInput = z.object({ 
    label:z.string().max(100).describe('Display label of the field'),
    description: z.string().max(100).optional().describe('helper text shown below the fied'),

    type: fieldTypeEnum.describe('Type of the field'),

    placeholder: z.string().max(50).optional().describe('placeholder text of the fied'), 
    isRequired: z.boolean().optional().default(false).describe('whether the field is required or not'),
    formId: z.string().uuid().describe('UUID of the form this field belong to')
}) 

export type CreateFieldInputType = z.infer<typeof createFieldInput>  

export const updateFieldInput = z.object({
    fieldId: z.string().uuid().describe('field Id we want to update'),
    label:z.string().max(100).describe('Updated display label'),
    type: fieldTypeEnum.optional().describe('Updated type of the field'),
    description: z.string().max(100).optional().nullable().describe('Updated Helper Text'),
    placeholder: z.string().max(50).optional().nullable().describe('Updated placeholder Text'),
    isRequired:  z.boolean().optional().default(false).describe('Updated required Flag'),

})  

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>   

export const deleteFieldInput = z.object({  
    fieldId: z.string().uuid().describe('UUID of field Id to delete'),
})

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>  

export const getFieldsInput = z.object({ 
    formId: z.string().uuid().describe('UUID of the form to fetch fields for ')

}) 

export type GetFieldsInputType = z.infer<typeof getFieldsInput>  

