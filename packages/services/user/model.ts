import {z} from 'zod'

export const createUserWithEmailandPasswordInput = z.object({ 

    fullName: z.string().describe(" Full name of the user"),
    email: z.email().describe("email address of user "),
    password:z.string().describe("password of the user")

})

export type CreateUserWithEmailandPasswordInputType = z.infer<typeof createUserWithEmailandPasswordInput > //Zod schema ko TypeScript type me convert karo." 

export const generateUserTokenPayload  = z.object({
    id: z.string().describe('uuid of the user')
}) 

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload> 