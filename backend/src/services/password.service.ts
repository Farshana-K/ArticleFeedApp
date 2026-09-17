import { IPasswordService } from "../contracts/password.service.interface";
import { comparePassword, hashPassword } from "../utils/password.util";
export class PasswordService implements IPasswordService {
  hash(value: string) {
    return hashPassword(value);
  }
  compare(value: string, hash: string) {
    return comparePassword(value, hash);
  }
}
