import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  numeric,
  pgEnum,
  unique
} from "drizzle-orm/pg-core";

import { formsTable } from "./form";

export const fieldTypeEnum = pgEnum('fieldTypeEnum', ['TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD'])

export const formsFieldsTable = pgTable("form-fields", {
  id: uuid("id").primaryKey().defaultRandom(), 

  label: varchar('label', {length: 100}).notNull(),
  label_key: varchar('label_key', {length: 100}).notNull(),

  description: text('description'),

  placeholder:text('placeholder'),
  isRequired: boolean('is_required').default(false).notNull(), 

  index: numeric('index', {scale: 2}).notNull(),

  type: fieldTypeEnum('type').notNull(),

  

  formId: uuid('form_id').references(()=> formsTable.id) ,

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),



}, (table) => { 
    return {
        uniqueFormIdAndIndex: unique().on(table.formId, table.index)
        // iska mtlb hai ek form ke andr same index ke upar nahi rakh sakte hai!
    }

});
