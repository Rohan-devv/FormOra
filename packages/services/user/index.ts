import { db, eq } from "@repo/database";
import * as JWT from "jsonwebtoken"
import { randomBytes, createHmac } from "node:crypto";
import { usersTable } from "@repo/database/models/user";
import {
  createUserWithEmailandPasswordInput,
  generateUserTokenPayload,
  GenerateUserTokenPayloadType,
  
  type CreateUserWithEmailandPasswordInputType,
} from "./model"; 

import { env } from "../env";

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }  

  private async generateUserToken (payload: GenerateUserTokenPayloadType) { 
     const {id} = await generateUserTokenPayload.parseAsync(payload)  
     const token = JWT.sign({id}, env.JWT_SECRET)
     return {token } 
  } 
  
  public async createUserWithEmailandPassword(payload: CreateUserWithEmailandPasswordInputType) {
    const { fullName, email, password } =
      await createUserWithEmailandPasswordInput.parseAsync(payload);

    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) throw new Error(`user with ${email} already exist`);
    const salt = randomBytes(16).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    const userInsertResult = await db
      .insert(usersTable)
      .values({ fullName, email, password: hash, salt })
      .returning({
        id: usersTable.id,
      });

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id)
      throw new Error(`something went wrong while creating a user `); 

    const userId = userInsertResult[0]?.id 

    const {token} = await this.generateUserToken({id: userId}) 
    return {
      id: userId,
      token
    };
  }
}

export default UserService;
