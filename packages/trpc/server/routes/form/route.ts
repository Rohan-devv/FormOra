import z from "zod";
import { formFieldService, formService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFieldInputModel,
  createFieldOutputModel,
  createFormInputModel,
  createFormOutputModel,
  deleteFieldInputModel,
  deleteFieldOutputModel,
  getFieldsInputModel,
  getFieldsOutputModel,
  listFormsByUserIdOutputModel,
  updateFieldInputModel,
  updateFieldOutputModel,
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  createForm: authenticatedProcedure.meta({ openapi: {
    method: "POST",
    path: getPath("/createForm"),
    tags: TAGS,
    protect: true

  }})
  .input(createFormInputModel)
  .output(createFormOutputModel)
  .mutation( async ({ input, ctx }) => {

    const { title, description } = input
    const { id } = await formService.createForm({
      title,
      description,
      createdBy: ctx.user.id
    })

    return {
      id
    }
  }),


  listForms: authenticatedProcedure.meta({ openapi: {
    method: "GET",
    path: getPath("/listForms"),
    tags: TAGS,
    protect: true

  }})
  .input(z.undefined())
  .output(listFormsByUserIdOutputModel)
  .query( async ({ ctx }) => {

    const { id } = ctx.user
    const forms = await formService.listFormsByUserId({ userId: id })

    return forms
  }),


  createField: authenticatedProcedure.meta({ openapi: {
    method: "POST",
    path: getPath("/createField"),
    tags: TAGS,
    protect: true

  }})
  .input(createFieldInputModel)
  .output(createFieldOutputModel)
  .mutation( async ({ input }) => {

    const { label, description, type, placeholder, isRequired, formId } = input
    const { id, labelKey, index } = await formFieldService.createField({
      label,
      description,
      type,
      placeholder,
      isRequired,
      formId
    })

    return {
      id,
      labelKey,
      index
    }
  }),


  updateField: authenticatedProcedure.meta({ openapi: {
    method: "PATCH",
    path: getPath("/updateField"),
    tags: TAGS,
    protect: true

  }})
  .input(updateFieldInputModel)
  .output(updateFieldOutputModel)
  .mutation( async ({ input }) => {

    const { fieldId, label, type, description, placeholder, isRequired } = input
    const { id } = await formFieldService.updateField({
      fieldId,
      label,
      type,
      description,
      placeholder,
      isRequired
    })

    return {
      id
    }
  }),


  deleteField: authenticatedProcedure.meta({ openapi: {
    method: "DELETE",
    path: getPath("/deleteField"),
    tags: TAGS,
    protect: true

  }})
  .input(deleteFieldInputModel)
  .output(deleteFieldOutputModel)
  .mutation( async ({ input }) => {

    const { fieldId } = input
    const { id } = await formFieldService.deleteField({
      fieldId
    })

    return {
      id
    }
  }),


  getFields: authenticatedProcedure.meta({ openapi: {
    method: "GET",
    path: getPath("/getFields"),
    tags: TAGS,
    protect: true

  }})
  .input(getFieldsInputModel)
  .output(getFieldsOutputModel)
  .query( async ({ input }) => {

    const { formId } = input
    const fields = await formFieldService.getFields({
      formId
    })

    return fields
  }),
});
