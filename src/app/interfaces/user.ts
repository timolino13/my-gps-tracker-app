import {RolesInterface} from './roles';

export interface UserInterface {
  id: string;
  email: string;
  roles: RolesInterface;
}
