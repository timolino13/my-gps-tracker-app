import {RolesInterface} from '../interfaces/roles';
import {UserDocumentInterface} from '../interfaces/user-document';

export class UserDocument implements UserDocumentInterface {
  id: string;
  email: string;
  roles: RolesInterface;
  verified: boolean;
}
