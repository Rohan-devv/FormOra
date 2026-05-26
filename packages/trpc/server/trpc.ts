import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { getAuthenticationCookie } from "./utils/cookie";
import { userService } from "./services";

export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
  const { ctx } = options;

  /*
{
  ctx: {
    createCookie: function,
    getCookie: function,
    clearCookie: function,
    user: undefined
  },
  input: {},
  path: "auth.getLoggedInUserInfo",
  type: "query",
  next: function
}

*/

  const userToken = getAuthenticationCookie(ctx);

  if (!userToken) throw new Error(`user is not logged In`);
  const { id } = await userService.verifyAndDecodeUserToken(userToken);

  return options.next({
    ctx: {
      ...ctx,
      user: { id },
    },
  });

  /*
    {
  createCookie: function,
  getCookie: function,
  clearCookie: function,
  user: {
    id: "user_123"
  }
}  

Yaha tRPC ko bol rahe ho: “ab actual resolver chalao, but ctx me logged-in user bhi daal do.”
     */
});
