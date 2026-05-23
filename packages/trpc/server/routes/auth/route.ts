
import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { setAuthenticationCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";
import { createUserWithEmailandPasswordInputModel, createUserWithEmailandPasswordOutputModel, signInUserWithEmailandPasswordInputModel, signInUserWithEmailandPasswordOutputModel } from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");


// ye hai humara procedure
export const authRouter = router({
  createUserwithEmailAndPassword: publicProcedure.meta({ openapi: { 
    method: 'POST',
    path: getPath('/createUserwithEmailAndPassword'),
    tags: TAGS

  }})
  .input(createUserWithEmailandPasswordInputModel)
  .output(createUserWithEmailandPasswordOutputModel)
  .mutation( async ({ input , ctx}) => { 

    const {fullName, email, password} = input 
    const {id, token} = await userService.createUserWithEmailandPassword({
      fullName, email, password
    })  
    
    setAuthenticationCookie(ctx, token)

    return {
      id
      
    } 
  }) ,

  signInUserWithEmailAndPassword: publicProcedure.meta({ openapi: { 
    method: 'POST',
    path: getPath('/signInUserwithEmailAndPassword'),
    tags: TAGS

  }})
  .input(signInUserWithEmailandPasswordInputModel)
  .output(signInUserWithEmailandPasswordOutputModel)
  .mutation( async({input , ctx}) => {
    const {email, password} = input 
    const {id, token} = await userService.signInUserWithEmailAndPassword({email, password}) 

    setAuthenticationCookie(ctx, token) 

     return {
      id
     }

  })
});
