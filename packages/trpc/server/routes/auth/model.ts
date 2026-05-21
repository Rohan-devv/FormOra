import {z} from "zod"

export const createUserWithEmailandPasswordInputModel = z.object({
    fullName: z.string().describe('name of the user'),
    email: z.string().describe('email of the user '),
    password: z.string().describe('password of the user')
})  

export const createUserWithEmailandPasswordOutputModel = z.object({
    id: z.string().describe('id of the created user')
})