import { Role } from '../ansible/types.js'
import { Assertions, Container } from '../types.js'

export function assertions(...roles: Role[]): Assertions {
  return { get_roles: () => roles }
}
