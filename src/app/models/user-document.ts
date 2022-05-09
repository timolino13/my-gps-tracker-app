import {Roles} from './roles';

export class UserDocument {
  id: string;
  email: string;
  roles: Roles;
  verified: boolean;
}
