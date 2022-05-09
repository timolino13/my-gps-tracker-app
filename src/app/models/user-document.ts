import {RolesInterface} from './interfaces/roles-interface';
import {UserDocumentInterface} from './interfaces/user-document-interface';

export class UserDocument implements UserDocument {
  id: string;
  email: string;
  roles: RolesInterface;
  verified: boolean;
}
