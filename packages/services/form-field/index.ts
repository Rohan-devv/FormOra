import { asc, db, eq, max } from "@repo/database";
import { formsFieldsTable } from "../../database/models/form-field";
import {
  createFieldInput,
  CreateFieldInputType,
  deleteFieldInput,
  DeleteFieldInputType,
  getFieldsInput,
  GetFieldsInputType,
  updateFieldInput,
  UpdateFieldInputType,
} from "./model";

function toLabelKey(label: string) {
  return label.toLowerCase().replace(/\s+/g, "_");
}

class FormFieldService {
  public async getNextIndex(formId: string) {
    const result = await db
      .select({ maxIndex: max(formsFieldsTable.index) })
      .from(formsFieldsTable)
      .where(eq(formsFieldsTable.formId, formId));

    const current = result[0]?.maxIndex;
    const next = current ? parseFloat(current) + 1 : 1;
    return next.toFixed(2);
  }

  public async createField(payload: CreateFieldInputType) {
    const { formId, label, description, type, placeholder, isRequired } =
      await createFieldInput.parseAsync(payload);

    const labelKey = toLabelKey(label);
    const index = await this.getNextIndex(formId);

    const result = await db
      .insert(formsFieldsTable)
      .values({
        formId,
        label,
        label_key: labelKey,
        description,
        type,
        placeholder,
        isRequired,
        index,
      })
      .returning({ id: formsFieldsTable.id });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("something went wrong while creating the field");
    }

    return {
      id: result[0]?.id,
      labelKey,
      index,
    };
  }

  public async updateField(payload: UpdateFieldInputType) {
    const { fieldId, ...updates } = await updateFieldInput.parseAsync(payload);

    const patch: Partial<typeof formsFieldsTable.$inferInsert> = {};
    if (updates.label !== undefined) patch.label = updates.label;
    if (updates.type !== undefined) patch.type = updates.type;
    if ("description" in updates) patch.description = updates.description ?? null;
    if ("placeholder" in updates) patch.placeholder = updates.placeholder ?? null;
    if (updates.isRequired !== undefined) patch.isRequired = updates.isRequired;

    if (Object.keys(patch).length === 0) throw new Error("There is no filed updated");

    const result = await db
      .update(formsFieldsTable)
      .set(patch)
      .where(eq(formsFieldsTable.id, fieldId))
      .returning({ id: formsFieldsTable.id });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error(`field with ${fieldId} does not exist`);
    }

    return {
      id: result[0]!.id,
    };
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { fieldId } = await deleteFieldInput.parseAsync(payload);

    const result = await db
      .delete(formsFieldsTable)
      .where(eq(formsFieldsTable.id, fieldId))
      .returning({ id: formsFieldsTable.id });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error(`field with ${fieldId} does not exist`);
    }
    return {
      id: result[0]!.id,
      message: "successfully deleted"
    };
  }

  public async getFields(payload: GetFieldsInputType) {
    const { formId } = await getFieldsInput.parseAsync(payload);

    const fields = await db
      .select({
        id: formsFieldsTable.id,
        label: formsFieldsTable.label,
        labelKey: formsFieldsTable.label_key,
        description: formsFieldsTable.description,
        placeholder: formsFieldsTable.placeholder,
        isRequired: formsFieldsTable.isRequired,
        index: formsFieldsTable.index,
        type: formsFieldsTable.type,
        formId: formsFieldsTable.formId,
        createdAt: formsFieldsTable.createdAt,
        updatedAt: formsFieldsTable.updatedAt,
      })
      .from(formsFieldsTable)
      .where(eq(formsFieldsTable.formId, formId))
      .orderBy(asc(formsFieldsTable.index));

    return fields;
  }
}  

export default FormFieldService;
