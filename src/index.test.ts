import { DID } from './did/did';
import * as u8a from 'uint8arrays';

describe('DID', () => {
  let did: DID;
  const mockSecretKey = new Uint8Array(32).fill(1); // Create a mock 32-byte key

  beforeEach(() => {
    did = new DID(mockSecretKey);
  });

  describe('constructor', () => {
    it('should initialize with a valid secret key', () => {
      expect(did.publicKey).toBeDefined();
      expect(did.publicKey instanceof Uint8Array).toBeTruthy();
    });
  });

  describe('did()', () => {
    it('should generate a valid DID string', () => {
      const didString = did.did();
      expect(didString.startsWith('did:key:')).toBeTruthy();
    });
  });

  describe('extractDIDKey', () => {
    it('should extract public key from a valid DID', () => {
      const didString = did.did();
      const extractedKey = did.extractDIDKey(didString);
      expect(extractedKey instanceof Uint8Array).toBeTruthy();
    });

    it('should throw error for invalid DID format', () => {
      expect(() => {
        did.extractDIDKey('invalid:did:format');
      }).toThrow();
    });
  });

  describe('static methods', () => {
    it('should validate DID format correctly', () => {
      const validDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      expect(DID.isValidDID(validDid)).toBeTruthy();
      
      const invalidDid = 'invalid:did:format';
      expect(DID.isValidDID(invalidDid)).toBeFalsy();
    });

    it('should parse DID correctly', () => {
      const validDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const parsed = DID.parseDID(validDid);
      expect(parsed.method).toBe('key');
    });
  });
});