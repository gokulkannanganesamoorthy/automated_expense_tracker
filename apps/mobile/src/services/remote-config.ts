import { remoteConfig, fetchAndActivate, getAll } from './firebase';

export interface BankPatternConfig {
  bank: string;
  type: 'debit' | 'credit';
  pattern: string;
}

export const remoteConfigService = {
  /**
   * Fetches latest remote config from Firebase and activates it.
   * Returns true if there were updates, false otherwise.
   */
  async updateConfig(): Promise<boolean> {
    try {
      // In production, you might want to wrap this in a check to ensure
      // we don't fetch too often, though Firebase SDK handles throttling internally
      // based on minimumFetchIntervalMillis.
      const fetchedAndActivated = await fetchAndActivate(remoteConfig);
      if (fetchedAndActivated) {
        console.log('[RemoteConfig] Fetched and activated new configs');
      } else {
        console.log('[RemoteConfig] No new configs fetched');
      }
      return fetchedAndActivated;
    } catch (error) {
      console.error('[RemoteConfig] Failed to fetch:', error);
      return false;
    }
  },

  /**
   * Gets the dynamically synced bank parsing patterns.
   * If offline, returns the default fallback patterns or previously cached ones.
   */
  getBankPatterns(): BankPatternConfig[] {
    try {
      const allConfigs = getAll(remoteConfig);
      const patternsString = allConfigs['bank_patterns']?.asString();
      
      if (!patternsString) return [];
      
      return JSON.parse(patternsString) as BankPatternConfig[];
    } catch (error) {
      console.error('[RemoteConfig] Failed to parse bank_patterns:', error);
      return [];
    }
  }
};
