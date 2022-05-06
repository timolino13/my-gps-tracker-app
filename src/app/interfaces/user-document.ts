import {RolesInterface} from './roles';

export interface UserDocumentInterface {
  id: string;
  email: string;
  roles: RolesInterface;
  verified: boolean;
}
