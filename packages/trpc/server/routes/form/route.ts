import z from "zod";
import { formService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormInputModel, createFormOutputModel, listFormsByUserIdOutputModel } from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS, 
        protect: true
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description } = input;

      const { id } = await formService.createForm({
        title,
        description,
        createdBy: ctx.user.id,
      });

      return { id };
    }),  

    listForms: authenticatedProcedure.meta({ openapi: {
      method: "GET",
        path: getPath("/listForms"),
        tags: TAGS, 
        protect: true
    }})
    .input(z.undefined())
    .output(listFormsByUserIdOutputModel)
    .query( async( { ctx } ) => { 

      const forms  = await formService.listFormsByUserId({userId: ctx.user.id}) 
      return forms 

    })  

    /* 
    
    DB return: title: string | null
    API expects: title: string

    Short me: database bol raha hai title null ho sakta hai, API schema bol raha hai title null nahi ho sakta. Dono match nahi kar rahe.

    */ 

});
