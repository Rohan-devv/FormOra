import {z} from "zod" 

export const createFormInputModel = z.object({ 
   title: z.string().min(1).max(50).describe("title of the form"),
  description: z.string().max(150).optional().nullable().describe("description of the form"),
 

})   

export const createFormOutputModel =  z.object({  
     id: z.string().describe('id of the created form')

})  

  

  export const listFormsByUserIdOutputModel= z.array( 
   z.object({
    id: z.string().describe('id of the created form'),
    title: z.string().describe("title of form"),
    description:z.string().nullable().optional().describe("Description of form"),
    createdAt:z.date().nullable().describe('Creation timestamp'),
    updatedAt:z.date().nullable().describe('Last updated timestamp'),
  }) 
)