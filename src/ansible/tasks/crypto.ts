import { CommonTaskAttrs, Task } from '../types.js'

type SshKeyAttrs = { path: string; type?: 'rsa' | 'dsa' | 'rsa1' | 'ecdsa' | 'ed25519'; passphrase?: string }
export function ssh_key(name: string, attrs: SshKeyAttrs, common: CommonTaskAttrs = {}): Task<'community.crypto.openssh_keypair', SshKeyAttrs> {
  return { name, 'community.crypto.openssh_keypair': attrs, ...common }
}
