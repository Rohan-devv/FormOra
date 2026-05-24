import { db, eq } from "@repo/database";
import * as JWT from "jsonwebtoken";
import { randomBytes, createHmac } from "node:crypto";
import { usersTable } from "@repo/database/models/user";
import {
  createUserWithEmailandPasswordInput,
  generateUserTokenPayload,
  GenerateUserTokenPayloadType,
  signInUserWithEmailandPasswordInput,
  signInUserWithEmailandPasswordInputType,
  type CreateUserWithEmailandPasswordInputType,
} from "./model";

import { env } from "../env";

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  } 

  private async verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType> {
    try {
      const verificationResult = await JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType
      return verificationResult;
    } catch (error) {
      throw new Error(`Invalid Token`);
    }
  }  

  public async getUserInfoById(id: string) {
    const user = await db.select({ 
      id: usersTable.id,
      email: usersTable.email,
      fullName: usersTable.fullName,
      profileImageUrl: usersTable.profileImageUrl
      
    }).from(usersTable).where(eq(usersTable.id, id)) 
    
    if(!user || user.length === 0) throw new Error(`User with this ${id} does not exist`) 
     return user[0]!


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

    const userId = userInsertResult[0]?.id;

    const { token } = await this.generateUserToken({ id: userId });
    return {
      id: userId,
      token,
    };
  }

  public async signInUserWithEmailAndPassword(payload: signInUserWithEmailandPasswordInputType) {
    const { email, password } = await signInUserWithEmailandPasswordInput.parseAsync(payload);
    const existingUser = await this.getUserByEmail(email);

    if (!existingUser) throw new Error(`User with ${email} already exist`);

    if (!existingUser.password || !existingUser.salt)
      throw new Error(`User password or salt is missing`);

    const hash = createHmac("sha256", existingUser.salt).update(password).digest("hex");

    if (hash !== existingUser.password) throw new Error(`Invalid email or password`);

    const { token } = await this.generateUserToken({ id: existingUser.id });

    return {
      id: existingUser.id,
      token,
    };
  }

  public async verifyAndDecodeUserToken(token: string) {
    const { id } = await this.verifyUserToken(token); 
    
    return {id}
  } 
  
}

export default UserService;
