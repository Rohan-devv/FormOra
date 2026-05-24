import { db } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { createFormInput, type CreateFormInputType } from "./model"

class FormService {
  public async createForm(payload: CreateFormInputType) {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload)

    const formInsertResult = await db
      .insert(formsTable)
      .values({
        title,
        description,
        createdBy,
      })
      .returning({
        id: formsTable.id,
      })

    if (!formInsertResult || formInsertResult.length === 0 || !formInsertResult[0]?.id)
      throw new Error(`something went wrong while creating a form`)

    const formId = formInsertResult[0].id

    return {
      id: formId,
    }
  }
}

export default FormService 
