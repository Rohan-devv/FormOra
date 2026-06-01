import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  numeric,
  pgEnum,
  unique,
  json
} from "drizzle-orm/pg-core";

import { formsTable } from "./form";
import { formsFieldsTable } from "../schema"; 

export interface FormSubmission { 
    formFieldId: string;
    value: string;

} 

export type FormSubmissionValueRow = FormSubmission[]


export const formsSubmissionTable = pgTable("form-submissions", {
  id: uuid("id").primaryKey().defaultRandom(), 

  

  formId: uuid('form_id').references(() => formsTable.id) , 
  
  values: json('values').$type<FormSubmissionValueRow>(),  // yaha pe hum form ke sare fields ke values ko json format me store karenge!

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),



})