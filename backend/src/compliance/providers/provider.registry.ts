import { Injectable } from '@nestjs/common';
import { CountryProvider } from '../compliance.interface';

@Injectable()
export class CountryProviderRegistry {
  private providers = new Map<string, CountryProvider>();

  register(provider: CountryProvider) {
    this.providers.set(provider.countryCode, provider);
  }

  getProvider(countryCode: string): CountryProvider {
    const provider = this.providers.get(countryCode);
    if (!provider) {
      throw new Error(`No compliance provider found for country: ${countryCode}`);
    }
    return provider;
  }

  getSupportedCountries(): string[] {
    return Array.from(this.providers.keys());
  }

  hasProvider(countryCode: string): boolean {
    return this.providers.has(countryCode);
  }
}
