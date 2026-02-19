import { PaymentProvider } from './base-provider';
import { CbeBirrProvider } from './cbe-birr.provider';
import { TelebirrProvider } from './telebirr.provider';
import { MpesaProvider } from './mpesa.provider';

export type ProviderType = 'CBE_BIRR' | 'TELEBIRR' | 'MPESA' | 'BANK_TRANSFER' | 'CARD';

export class PaymentProviderFactory {
  static getProvider(providerType: ProviderType): PaymentProvider {
    switch (providerType) {
      case 'CBE_BIRR':
        return new CbeBirrProvider();
      case 'TELEBIRR':
        return new TelebirrProvider();
      case 'MPESA':
        return new MpesaProvider();
      case 'BANK_TRANSFER':
      case 'CARD':
        throw new Error(`${providerType} provider not implemented yet`);
      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }
}
