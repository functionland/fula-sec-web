import { HMAC } from '@stablelib/hmac';
import { SHA512 } from '@stablelib/sha512';
import { extractPublicKeyFromSecretKey, sign } from '@stablelib/ed25519';
import { replaceDerive, pathRegex } from './utils/utils.js';
import { stringToBytes, bytesToBase64url } from '../../utils/u8a.multiformats';
import * as EdKey from './keyPair/ed25519.js';
import * as u8a from 'uint8arrays';
import sha3 from 'js-sha3';
import { Signer } from 'did-jwt';

type Hex = string;
type Path = string;

type Keys = {
  key: Uint8Array;
  chainCode: Uint8Array;
};

export type exportKeyPair = {
  publicKey: string,
  secretKey: string
};

const ED25519_CURVE = 'ed25519 seed';
const HARDENED_OFFSET = 0x80000000;

export class HDKEY {
  private _Key!: Keys;
  private _secretKey!: Uint8Array;
  chainCode: string;

  constructor(password: string) {
    this.chainCode = this._splitKey(password);
  }

  private _splitKey(password: string) {
    const hexSeed = sha3.keccak256(password);
    const hmac = new HMAC(SHA512, u8a.fromString(ED25519_CURVE));
    const secretKey = hmac.update(u8a.fromString(hexSeed, 'hex')).digest();
    const IL = secretKey.slice(0, 32);
    const IR = secretKey.slice(32);
    const key = IL;
    const chainCode = IR;
    this._Key = {
      key,
      chainCode
    };
    return u8a.toString(this._Key.chainCode, 'base64pad');
  }

  getEd25519Signer(): Signer {
    const privateKeyByte: Uint8Array = this._secretKey;
    if (privateKeyByte.length !== 64) {
      throw new Error(`Invalid key format. Key bytes length must be 64, but got ${privateKeyByte.length}`);
    }
    return async (data: string | Uint8Array): Promise<string> => {
      const dataBytes: Uint8Array = typeof data === 'string' ? stringToBytes(data) : data;
      const sig: Uint8Array = sign(privateKeyByte, dataBytes);
      return bytesToBase64url(sig);
    };
  }

  createEDKeyPair(signedKey: Hex): EdKey.EdKeypair {
    const key = u8a.toString(this._Key.key, 'base64pad');
    const hexSeed = sha3.keccak256(key.concat(signedKey));
    const hmac = new HMAC(SHA512, u8a.fromString(ED25519_CURVE));
    const secretKey = hmac.update(u8a.fromString(hexSeed, 'hex')).digest();
    this._secretKey = secretKey;
    return EdKey.EdKeypair.fromSecretKey(u8a.toString(this._secretKey, 'base64pad'));
  }

  exportEDKeyPair(secretKey?: Uint8Array): exportKeyPair {
    const publicKey = extractPublicKeyFromSecretKey(secretKey || this._secretKey);
    return {
      publicKey: u8a.toString(publicKey, 'base64pad'),
      secretKey: u8a.toString(secretKey || this._secretKey, 'base64pad')
    };
  }

  private _extendPrivateKey({ key, chainCode }: Keys, index: number): Keys {
    const indexBuffer = new Uint8Array(4);
    new DataView(indexBuffer.buffer).setUint32(0, index);
    const data = new Uint8Array([0, ...key, ...indexBuffer]);
    const I = new HMAC(SHA512, chainCode).update(data).digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
      key: IL,
      chainCode: IR
    };
  }

  isValidPath(path: string): boolean {
    if (!pathRegex.test(path)) {
      return false;
    }
    return !path.split('/').slice(1).map(replaceDerive).some(isNaN as any);
  }

  private _deriveKeyPath(path: Path, offset = HARDENED_OFFSET): Keys {
    if (!this.isValidPath(path)) {
      throw new Error('Invalid derivation path');
    }

    const { key, chainCode } = this._Key;
    const segments = path.split('/').slice(1).map(replaceDerive).map(el => parseInt(el, 10));

    return segments.reduce((parentKeys, segment) => this._extendPrivateKey(parentKeys, segment + offset), { key, chainCode });
  }

  deriveKeyPath(path: Path, offset = HARDENED_OFFSET): EdKey.EdKeypair {
    const { key, chainCode } = this._deriveKeyPath(path, offset);
    const secretKey = new Uint8Array([...key, ...chainCode]);
    return EdKey.EdKeypair.fromSecretKey(u8a.toString(secretKey, 'base64pad'));
  }

  exportKeyPath(path: Path, offset = HARDENED_OFFSET): exportKeyPair {
    const { key, chainCode } = this._deriveKeyPath(path, offset);
    const secretKey = new Uint8Array([...key, ...chainCode]);
    const publicKey = extractPublicKeyFromSecretKey(secretKey);
    return {
      publicKey: u8a.toString(publicKey, 'base64pad'),
      secretKey: u8a.toString(secretKey, 'base64pad')
    };
  }
}
