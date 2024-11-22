import { decryptJWE, createJWE, JWE,
  x25519Encrypter,
  x25519Decrypter,
  Encrypter,
} from 'did-jwt'
import { generateKeyPairFromSeed } from '@stablelib/x25519'
import * as u8a from 'uint8arrays'
import { InvalidDid } from '../did/utils/errors.js';
import { BASE58_DID_PREFIX, EDWARDS_DID_PREFIX } from "./utils/encode.prefix.js"

export type CreateJWEOptions = {
  protectedHeader?: Record<string, any>;
  aad?: Uint8Array;
};

export type DecryptJWEOptions = {
  did?: string;
};

export class DID {
  publicKey: Uint8Array;
  private _privateKey: Uint8Array;

  constructor(secretKey: Uint8Array) {
    this._privateKey = secretKey.slice(0, 32);
    this.publicKey = generateKeyPairFromSeed(this._privateKey).publicKey;
  }

  private _didToBytes(did: string, prefix: Uint8Array): Uint8Array {
    if (!did.startsWith(BASE58_DID_PREFIX)) {
      throw new Error('DID encoding format must be base58btc or should include did:key:xyz...');
    }
    const cutDIDBase58Key = did.slice(BASE58_DID_PREFIX.length);
    const extractBytes = u8a.fromString(cutDIDBase58Key, 'base58btc');
    if (!u8a.equals(extractBytes.subarray(0, prefix.byteLength), prefix)) {
      throw new Error(`Expected prefix format is ${prefix}`);
    }
    return extractBytes.slice(prefix.length);
  }

  extractDIDKey(did: string): Uint8Array {
    return this._didToBytes(did, EDWARDS_DID_PREFIX);
  }

  private _didFromKeyBytes(publicKeyBytes: Uint8Array, prefix: Uint8Array): string {
    const bytes = u8a.concat([prefix, publicKeyBytes]);
    const base58Key = u8a.toString(bytes, 'base58btc');
    return BASE58_DID_PREFIX + base58Key;
  }

  did(): string {
    return this._didFromKeyBytes(this.publicKey, EDWARDS_DID_PREFIX);
  }

  static parseDID(did: string) {
    const match = did.match(/did:(\w+):(\w+).*/);
    if (!match) {
      throw new InvalidDid(did);
    }
    return { method: match[1], identifier: match[2] };
  }

  static isValidDID(did: string) {
    try {
      this.parseDID(did);
      return true;
    } catch (err) {
      return false;
    }
  }

  private _encrypter(publicKey: Array<Uint8Array>): Encrypter[] {
    return publicKey.map(key => x25519Encrypter(u8a.fromString(u8a.toString(key))));
  }

  private _decrypter() {
    return x25519Decrypter(this._privateKey);
  }

  async createJWE(
    cleartext: string,
    recipients: Encrypter[] | Array<Uint8Array>,
    options: CreateJWEOptions = {}
  ): Promise<JWE> {
    if (!recipients.map(key => key.alg).includes('ECDH-ES+XC20PKW')) {
      recipients = this._encrypter(recipients as Array<Uint8Array>);
    }
    const preparedCleartext = u8a.fromString(cleartext);
    return await createJWE(preparedCleartext, recipients as Encrypter[], options.protectedHeader, options.aad);
  }

  async decryptJWE(jwe: JWE): Promise<string> {
    const decrypter = this._decrypter();
    const bytes = await decryptJWE(jwe, decrypter);
    return u8a.toString(bytes);
  }
}
