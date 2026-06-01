import {asc, db, eq} from "@repo/database"
import {formsTable} from "@repo/database/models/form"
import { formsFieldsTable } from "@repo/database/models/form-field";
import { createFormInput, CreateFormInputType, getPublicFormByIdInput, GetPublicFormByIdInputType, ListallFormsInputType, listFormsByUserIdInput } from "./model";
import { usersTable } from "@repo/database/models/user";


class FormService {
  public async createForm(payload: CreateFormInputType) { 

    const{title, description, createdBy} = await createFormInput.parseAsync(payload) 


    const formInsertResult = await db.insert(formsTable).values({
      title, 
      description, 
      createdBy
    }).returning({
      id: formsTable.id
    }) 

    if(!formInsertResult || formInsertResult.length === 0 || !formInsertResult[0]?.id){
      throw new Error ("something went wrong")
    } 

    const formId = formInsertResult[0].id


    return {
      id: formId 
    }

  }   

  public async listFormsByUserId(payload: ListallFormsInputType) {  

    const {userId} = await listFormsByUserIdInput.parseAsync(payload) 

    const forms  = await db.select({
      id:formsTable.id,
      title: formsTable.title,
      description:formsTable.description,
      createdAt: formsTable.createdAt,
      updatedAt:formsTable.updatedAt
    })
    .from(formsTable)
    .where(eq(formsTable.createdBy, userId)) 

    return forms
  }  

  public async getPublicFormById(payload: GetPublicFormByIdInputType) {
    const { formId } = await getPublicFormByIdInput.parseAsync(payload)

    const formResult = await db.select({
      id: formsTable.id,
      title: formsTable.title,
      description: formsTable.description,
    })
    .from(formsTable)
    .where(eq(formsTable.id, formId))
    .limit(1)

    const form = formResult[0]

    if (!form) throw new Error(`form with ${formId} does not exist`)

    const fields = await db.select({
      id: formsFieldsTable.id,
      label: formsFieldsTable.label,
      labelKey: formsFieldsTable.label_key,
      description: formsFieldsTable.description,
      placeholder: formsFieldsTable.placeholder,
      isRequired: formsFieldsTable.isRequired,
      index: formsFieldsTable.index,
      type: formsFieldsTable.type,
    })
    .from(formsFieldsTable)
    .where(eq(formsFieldsTable.formId, formId))
    .orderBy(asc(formsFieldsTable.index))

    return {
      ...form,
      fields,
    }
  }

  
}

export default FormService











































// import { db } from "@repo/database"
// import { formsTable } from "@repo/database/models/form"
// import { createFormInput, type CreateFormInputType } from "./model"

// class FormService {
//   public async createForm(payload: CreateFormInputType) {
//     const { title, description, createdBy } = await createFormInput.parseAsync(payload)

//     const formInsertResult = await db
//       .insert(formsTable)
//       .values({
//         title,
//         description,
//         createdBy,
//       })
//       .returning({
//         id: formsTable.id,
//       })

//     if (!formInsertResult || formInsertResult.length === 0 || !formInsertResult[0]?.id)
//       throw new Error(`something went wrong while creating a form`)

//     const formId = formInsertResult[0].id

//     return {
//       id: formId,
//     }
//   }
// }

// export default FormService 
