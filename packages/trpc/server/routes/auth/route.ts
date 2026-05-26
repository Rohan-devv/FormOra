
import { userService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { getAuthenticationCookie, setAuthenticationCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";
import { createUserWithEmailandPasswordInputModel, createUserWithEmailandPasswordOutputModel, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, signInUserWithEmailandPasswordInputModel, signInUserWithEmailandPasswordOutputModel } from "./model";

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

  }), 
  
  
  getLoggedInUserInfo: authenticatedProcedure.meta( 
    { openapi: { 
    method: 'GET',
    path: getPath('/getLoggedInUserInfo'),
    tags: TAGS,
    protect: true

  }}
  )
  .input(getLoggedInUserInfoInputModel)
  .output(getLoggedInUserInfoOutputModel)
  .query( async({ctx}) => {  

    
     const {id, email, fullName, profileImageUrl}  = await userService.getUserInfoById(ctx.user.id)
    
    
    return { 
      id, 
      email, 
      fullName, 
      profileImageUrl

    }

  })


});
