declare module '@functionland/fula-sec-web/did/did' {
  import { JWE, Encrypter } from 'did-jwt';
  export type CreateJWEOptions = {
      protectedHeader?: Record<string, any>;
      aad?: Uint8Array;
  };
  export type DecryptJWEOptions = {
      did?: string;
  };
  export class DID {
      publicKey: Uint8Array;
      private _privateKey;
      constructor(secretKey: Uint8Array);
      private _didToBytes;
      extractDIDKey(did: string): Uint8Array;
      private _didFromKeyBytes;
      did(): string;
      static parseDID(did: string): {
          method: string;
          identifier: string;
      };
      static isValidDID(did: string): boolean;
      private _encrypter;
      private _decrypter;
      createJWE(cleartext: string, recipients: Encrypter[] | Array<Uint8Array>, options?: CreateJWEOptions): Promise<JWE>;
      decryptJWE(jwe: JWE): Promise<string>;
  }

}
declare module '@functionland/fula-sec-web/did/hkey/key' {
  import * as EdKey from '@functionland/fula-sec-web/did/hkey/keyPair/ed25519.js/index';
  import { Signer } from 'did-jwt';
  type Hex = string;
  type Path = string;
  export type exportKeyPair = {
      publicKey: string;
      secretKey: string;
  };
  export class HDKEY {
      private _Key;
      private _secretKey;
      chainCode: string;
      constructor(password: string);
      private _splitKey;
      getEd25519Signer(): Signer;
      createEDKeyPair(signedKey: Hex): EdKey.EdKeypair;
      exportEDKeyPair(secretKey?: Uint8Array): exportKeyPair;
      private _extendPrivateKey;
      isValidPath(path: string): boolean;
      private _deriveKeyPath;
      deriveKeyPath(path: Path, offset?: number): EdKey.EdKeypair;
      exportKeyPath(path: Path, offset?: number): exportKeyPair;
  }
  export {};

}
declare module '@functionland/fula-sec-web/did/hkey/keyPair/base' {
  import { Keypair, KeyType, Encodings, ExportableKey } from '@functionland/fula-sec-web/did/hkey/keyPair/types.js/index';
  export default abstract class BaseKeypair implements Keypair, ExportableKey {
      publicKey: Uint8Array;
      keyType: KeyType;
      exportable: boolean;
      constructor(publicKey: Uint8Array, keyType: KeyType, exportable: boolean);
      publicKeyStr(encoding?: Encodings): string;
      abstract sign(msg: Uint8Array): Promise<Uint8Array>;
      abstract export(): Promise<string>;
  }

}
declare module '@functionland/fula-sec-web/did/hkey/keyPair/ed25519' {
  import BaseKeypair from '@functionland/fula-sec-web/did/hkey/keyPair/base.js/index';
  import { Encodings } from '@functionland/fula-sec-web/did/hkey/keyPair/types.js/index';
  export class EdKeypair extends BaseKeypair {
      secretKey: Uint8Array;
      publicKey: Uint8Array;
      constructor(secretKey: Uint8Array, publicKey: Uint8Array, exportable: boolean);
      static create(params?: {
          exportable: boolean;
      }): Promise<EdKeypair>;
      static fromSecretKey(key: string, params?: {
          format?: Encodings;
          exportable?: boolean;
      }): EdKeypair;
      sign(msg: Uint8Array): Promise<Uint8Array>;
      export(format?: Encodings): Promise<string>;
  }
  export default EdKeypair;

}
declare module '@functionland/fula-sec-web/did/hkey/keyPair/types' {
  import { SupportedEncodings } from 'uint8arrays/util/bases.js';
  export type Fact = Record<string, unknown>;
  export interface ExportableKey {
      export: (format?: Encodings) => Promise<string>;
  }
  export interface Keypair {
      publicKey: Uint8Array;
      keyType: KeyType;
      sign: (msg: Uint8Array) => Promise<Uint8Array>;
  }
  export type KeyType = 'rsa' | 'p256' | 'p384' | 'p521' | 'ed25519' | 'bls12-381';
  export type NamedCurve = 'P-256' | 'P-384' | 'P-521';
  export type Encodings = SupportedEncodings;

}
declare module '@functionland/fula-sec-web/did/hkey/utils/utils' {
  export const pathRegex: RegExp;
  export const replaceDerive: (val: string) => string;

}
declare module '@functionland/fula-sec-web/did/utils/encode.prefix' {
  export const EDWARDS_DID_PREFIX: Uint8Array;
  export const BASE58_DID_PREFIX = "did:key:z";

}
declare module '@functionland/fula-sec-web/did/utils/errors' {
  export class BaseError extends Error {
      constructor(message: any, code: any, props?: any);
  }
  export class DuplicateAuthentication extends BaseError {
      constructor(id: any);
  }
  export class InvalidAuthentication extends BaseError {
      constructor(message?: any);
  }
  export class DuplicatePublicKey extends BaseError {
      constructor(id: any);
  }
  export class InvalidPublicKey extends BaseError {
      constructor(message: any);
  }
  export class DuplicateService extends BaseError {
      constructor(id: any);
  }
  export class InvalidService extends BaseError {
      constructor(message: any);
  }
  export class InvalidDid extends BaseError {
      constructor(did: any, message?: any, props?: any);
  }
  export class IllegalCreate extends BaseError {
      constructor(message?: any);
  }
  export class UnavailableIpfs extends BaseError {
      constructor(message?: any);
  }
  export class InvalidDocument extends BaseError {
      constructor(message: any);
  }
  export class InvalidIdPrefix extends BaseError {
      constructor();
  }

}
declare module '@functionland/fula-sec-web/index' {
  import { HDKEY } from '@functionland/fula-sec-web/did/hkey/key.js/index';
  import { DID } from '@functionland/fula-sec-web/did/did.js/index';
  export { DID, HDKEY };
  export { exportKeyPair } from '@functionland/fula-sec-web/did/hkey/key.js/index';

}
declare module '@functionland/fula-sec-web/utils/u8a.multiformats' {
  /**
   * @deprecated Signers will be expected to return base64url `string` signatures.
   */
  export interface EcdsaSignature {
      r: string;
      s: string;
      recoveryParam?: number | null;
  }
  export function stringHexToU8a(string: string): Uint8Array;
  export function bytesToBase64url(b: Uint8Array): string;
  export function base64ToBytes(s: string): Uint8Array;
  export function bytesToBase64(b: Uint8Array): string;
  export function base58ToBytes(s: string): Uint8Array;
  export function bytesToBase58(b: Uint8Array): string;
  export function hexToBytes(s: string): Uint8Array;
  export function encodeBase64url(s: string): string;
  export function decodeBase64url(s: string): string;
  export function bytesToHex(b: Uint8Array): string;
  export function stringToBytes(s: string): Uint8Array;
  export function bytesToString(b: Uint8Array): string;
  export function toJose({ r, s, recoveryParam }: EcdsaSignature, recoverable?: boolean): string;
  export function fromJose(signature: string): {
      r: string;
      s: string;
      recoveryParam?: number;
  };
  export function toSealed(ciphertext: string, tag: string): Uint8Array;
  export function leftpad(data: string, size?: number): string;

}
declare module '@functionland/fula-sec-web' {
  import main = require('@functionland/fula-sec-web/src/index');
  export = main;
}