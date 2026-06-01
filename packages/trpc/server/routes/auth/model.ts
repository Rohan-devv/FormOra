import {z} from "zod"

export const createUserWithEmailandPasswordInputModel = z.object({
    fullName: z.string().describe('name of the user'),
    email: z.string().describe('email of the user '),
    password: z.string().describe('password of the user')
})  

export const createUserWithEmailandPasswordOutputModel = z.object({
    id: z.string().describe('id of the created user'),
     fullName: z.string().describe('name of the user')
})  


export const signInUserWithEmailandPasswordInputModel = z.object({
   
    email: z.string().describe('email of the user '),
    password: z.string().describe('password of the user')
})  
 
export const signInUserWithEmailandPasswordOutputModel = z.object({
    id: z.string().describe('id of the created user')
})    

export const getLoggedInUserInfoInputModel = z.undefined()

export const getLoggedInUserInfoOutputModel = z.object({
     id: z.string().describe('id of the created user'),
     email: z.string().describe('email of the user '), 
     fullName: z.string().describe('name of the user'),
     profileImageUrl: z.string().describe('profileImageUrl of the user').optional().nullable(),
})


