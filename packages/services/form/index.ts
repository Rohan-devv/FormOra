import {db, eq} from "@repo/database"  
import {formsTable} from "@repo/database/models/form"
import { createFormInput, CreateFormInputType, ListallFormsInputType, listFormsByUserIdInput } from "./model";
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
