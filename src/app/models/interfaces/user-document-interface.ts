import {RolesInterface} from './roles-interface';

export interface UserDocumentInterface {
  id: string;
  email: string;
  roles: RolesInterface;
  verified: boolean;
}
