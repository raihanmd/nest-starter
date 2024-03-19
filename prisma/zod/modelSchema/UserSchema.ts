import { z } from 'zod';
import { UserRoleSchema } from '../inputTypeSchemas/UserRoleSchema'

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: UserRoleSchema,
  id: z.string().cuid(),
  username: z.string().min(3).max(15),
  password: z.string().min(8).max(255),
  token: z.string().nullable(),
  lastIp: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const UserOptionalDefaultsSchema = UserSchema.merge(z.object({
  role: UserRoleSchema.optional(),
  id: z.string().cuid().optional(),
}))

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>

export default UserSchema;
