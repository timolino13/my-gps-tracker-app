import {RolesInterface} from '../interfaces/roles';
import {UserInterface} from '../interfaces/user';

export class User implements UserInterface {
  id: string;
  email: string;
  roles: RolesInterface;
  verified: boolean;
}
