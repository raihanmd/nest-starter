import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN','MEMBER']);

export type UserRoleType = `${z.infer<typeof UserRoleSchema>}`

export default UserRoleSchema;
