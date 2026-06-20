import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Transaction,
  TransactionFilter,
  TransactionSortField,
  SortDirection,
} from '@expense-tracker/shared';

// ═══════════════════════════════════════════════════════════
// TRANSACTION STATE
// ═══════════════════════════════════════════════════════════

interface TransactionState {
  // Data
  transactions: Transaction[];
  recentTransactions: Transaction[]; // Last 5 for home screen
  totalCount: number;

  // Filter/Sort
  activeFilter: TransactionFilter;
  sortField: TransactionSortField;
  sortDirection: SortDirection;
  searchQuery: string;

  // Pagination
  page: number;
  pageSize: number;
  hasMore: boolean;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  selectedIds: Set<string>;
  isMultiSelectMode: boolean;
  error: string | null;

  // Review queue
  reviewQueueCount: number;
}

interface TransactionActions {
  // Data management
  setTransactions: (transactions: Transaction[], totalCount: number) => void;
  appendTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  setRecentTransactions: (transactions: Transaction[]) => void;

  // Filter/Sort
  setFilter: (filter: Partial<TransactionFilter>) => void;
  clearFilter: () => void;
  setSortField: (field: TransactionSortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  setSearchQuery: (query: string) => void;

  // Pagination
  nextPage: () => void;
  resetPagination: () => void;
  setHasMore: (hasMore: boolean) => void;

  // Multi-select
  toggleMultiSelect: () => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // UI State
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Review
  setReviewQueueCount: (count: number) => void;
}

type TransactionStore = TransactionState & TransactionActions;

const INITIAL_FILTER: TransactionFilter = {};

const INITIAL_STATE: TransactionState = {
  transactions: [],
  recentTransactions: [],
  totalCount: 0,
  activeFilter: INITIAL_FILTER,
  sortField: 'date',
  sortDirection: 'desc',
  searchQuery: '',
  page: 0,
  pageSize: 50,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  selectedIds: new Set(),
  isMultiSelectMode: false,
  error: null,
  reviewQueueCount: 0,
};

// ═══════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════

export const useTransactionStore = create<TransactionStore>()(
  immer((set) => ({
    ...INITIAL_STATE,

    setTransactions: (transactions, totalCount) => {
      set((state) => {
        state.transactions = transactions;
        state.totalCount = totalCount;
        state.isLoading = false;
        state.error = null;
      });
    },

    appendTransactions: (newTransactions) => {
      set((state) => {
        const existingIds = new Set(state.transactions.map((t) => t.id));
        const unique = newTransactions.filter((t) => !existingIds.has(t.id));
        state.transactions.push(...unique);
        state.isLoadingMore = false;
      });
    },

    addTransaction: (transaction) => {
      set((state) => {
        // Add at the beginning (most recent first)
        state.transactions.unshift(transaction);
        state.totalCount += 1;

        // Update recent transactions
        state.recentTransactions = state.transactions.slice(0, 5);
      });
    },

    updateTransaction: (id, updates) => {
      set((state) => {
        const index = state.transactions.findIndex((t) => t.id === id);
        if (index !== -1) {
          const txn = state.transactions[index];
          if (txn) {
            Object.assign(txn, updates, { updatedAt: new Date().toISOString() });
          }
        }
        // Also update in recent if present
        const recentIndex = state.recentTransactions.findIndex((t) => t.id === id);
        if (recentIndex !== -1) {
          const recentTxn = state.recentTransactions[recentIndex];
          if (recentTxn) {
            Object.assign(recentTxn, updates, { updatedAt: new Date().toISOString() });
          }
        }
      });
    },

    removeTransaction: (id) => {
      set((state) => {
        state.transactions = state.transactions.filter((t) => t.id !== id);
        state.recentTransactions = state.recentTransactions.filter((t) => t.id !== id);
        state.totalCount = Math.max(0, state.totalCount - 1);
        state.selectedIds.delete(id);
      });
    },

    setRecentTransactions: (transactions) => {
      set((state) => {
        state.recentTransactions = transactions;
      });
    },

    setFilter: (filter) => {
      set((state) => {
        state.activeFilter = { ...state.activeFilter, ...filter };
        state.page = 0;
        state.hasMore = true;
      });
    },

    clearFilter: () => {
      set((state) => {
        state.activeFilter = INITIAL_FILTER;
        state.page = 0;
        state.hasMore = true;
      });
    },

    setSortField: (field) => {
      set((state) => {
        state.sortField = field;
        state.page = 0;
        state.hasMore = true;
      });
    },

    setSortDirection: (direction) => {
      set((state) => {
        state.sortDirection = direction;
        state.page = 0;
        state.hasMore = true;
      });
    },

    setSearchQuery: (query) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    nextPage: () => {
      set((state) => {
        state.page += 1;
      });
    },

    resetPagination: () => {
      set((state) => {
        state.page = 0;
        state.hasMore = true;
      });
    },

    setHasMore: (hasMore) => {
      set((state) => {
        state.hasMore = hasMore;
      });
    },

    toggleMultiSelect: () => {
      set((state) => {
        state.isMultiSelectMode = !state.isMultiSelectMode;
        if (!state.isMultiSelectMode) {
          state.selectedIds = new Set();
        }
      });
    },

    toggleSelection: (id) => {
      set((state) => {
        if (state.selectedIds.has(id)) {
          state.selectedIds.delete(id);
        } else {
          state.selectedIds.add(id);
        }
      });
    },

    selectAll: () => {
      set((state) => {
        state.selectedIds = new Set(state.transactions.map((t) => t.id));
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedIds = new Set();
        state.isMultiSelectMode = false;
      });
    },

    setLoading: (loading) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    setRefreshing: (refreshing) => {
      set((state) => {
        state.isRefreshing = refreshing;
      });
    },

    setLoadingMore: (loading) => {
      set((state) => {
        state.isLoadingMore = loading;
      });
    },

    setError: (error) => {
      set((state) => {
        state.error = error;
        state.isLoading = false;
        state.isRefreshing = false;
      });
    },

    setReviewQueueCount: (count) => {
      set((state) => {
        state.reviewQueueCount = count;
      });
    },
  })),
);

// ═══════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════

export const selectTodaySpentPaise = (state: TransactionState): number => {
  const today = new Date().toISOString().split('T')[0];
  return state.transactions
    .filter((t) => t.date.startsWith(today ?? '') && t.type === 'debit' && !t.isDeleted)
    .reduce((sum, t) => sum + t.amountPaise, 0);
};

export const selectSelectedTransactions = (state: TransactionState): Transaction[] => {
  return state.transactions.filter((t) => state.selectedIds.has(t.id));
};

export const selectHasActiveFilter = (state: TransactionState): boolean => {
  const f = state.activeFilter;
  return !!(
    f.categories?.length ||
    f.types?.length ||
    f.sources?.length ||
    f.banks?.length ||
    f.dateFrom ||
    f.dateTo ||
    f.amountMinPaise ||
    f.amountMaxPaise ||
    f.merchantSearch ||
    f.isRecurring !== undefined ||
    f.needsReview !== undefined ||
    f.tags?.length
  );
};
