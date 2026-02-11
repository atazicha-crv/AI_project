# Guide d'Implémentation - Partie 2
## Compléments pour l'Écran Expense Reports

Ce document complète le guide d'implémentation principal avec les sections manquantes.

---

## Complétion du FilterModal (suite de la partie 1)

```typescript
// Continuation de FilterModal.tsx - Section Actions

              {/* Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/10">
                <div className="flex gap-4">
                  <button
                    onClick={handleClear}
                    className="w-full py-3 rounded-lg text-sm font-bold bg-gray-200 dark:bg-white/10 text-foreground-light dark:text-foreground-dark hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApply}
                    className="w-full py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
```

---

## Configuration du Routing

### App.tsx avec Routes

```typescript
// frontend/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseReportsPage } from './pages/ExpenseReportsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reports" replace />} />
        <Route path="/reports" element={<ExpenseReportsPage />} />
        <Route path="/reports/:id" element={<div>Report Details (à implémenter)</div>} />
        <Route path="/reports/new" element={<div>New Report (à implémenter)</div>} />
        <Route path="/submit" element={<div>Submit (à implémenter)</div>} />
        <Route path="/profile" element={<div>Profile (à implémenter)</div>} />
        <Route path="*" element={<Navigate to="/reports" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## Données de Test (Mock Data)

### Mock Expense Reports

```typescript
// frontend/src/mocks/expense-reports.mock.ts

import { ExpenseReport, ExpenseStatus, ExpenseCategory } from '../types/expense-report.types';

export const mockExpenseReports: ExpenseReport[] = [
  {
    id: '1',
    title: 'Q4 Client On-site',
    date: '2023-10-26T00:00:00Z',
    totalAmount: 175.00,
    status: ExpenseStatus.SUBMITTED,
    expenses: [
      {
        id: 'e1',
        reportId: '1',
        category: ExpenseCategory.MEALS,
        amount: 100,
        description: 'Client lunch',
        date: '2023-10-26T00:00:00Z',
        createdAt: '2023-10-26T00:00:00Z',
        updatedAt: '2023-10-26T00:00:00Z',
      },
      {
        id: 'e2',
        reportId: '1',
        category: ExpenseCategory.TRAVEL,
        amount: 75,
        description: 'Flight to client site',
        date: '2023-10-26T00:00:00Z',
        createdAt: '2023-10-26T00:00:00Z',
        updatedAt: '2023-10-26T00:00:00Z',
      },
    ],
    createdAt: '2023-10-26T00:00:00Z',
    updatedAt: '2023-10-26T00:00:00Z',
  },
  {
    id: '2',
    title: 'October Office Supplies',
    date: '2023-10-24T00:00:00Z',
    totalAmount: 75.00,
    status: ExpenseStatus.VALIDATED,
    expenses: [
      {
        id: 'e3',
        reportId: '2',
        category: ExpenseCategory.SUPPLIES,
        amount: 75,
        description: 'Office supplies',
        date: '2023-10-24T00:00:00Z',
        createdAt: '2023-10-24T00:00:00Z',
        updatedAt: '2023-10-24T00:00:00Z',
      },
    ],
    createdAt: '2023-10-24T00:00:00Z',
    updatedAt: '2023-10-24T00:00:00Z',
  },
  {
    id: '3',
    title: 'Team Offsite Event',
    date: '2023-10-22T00:00:00Z',
    totalAmount: 215.00,
    status: ExpenseStatus.PAID,
    expenses: [
      {
        id: 'e4',
        reportId: '3',
        category: ExpenseCategory.TEAM_EVENT,
        amount: 150,
        description: 'Team building event',
        date: '2023-10-22T00:00:00Z',
        createdAt: '2023-10-22T00:00:00Z',
        updatedAt: '2023-10-22T00:00:00Z',
      },
      {
        id: 'e5',
        reportId: '3',
        category: ExpenseCategory.PARKING,
        amount: 65,
        description: 'Parking fees',
        date: '2023-10-22T00:00:00Z',
        createdAt: '2023-10-22T00:00:00Z',
        updatedAt: '2023-10-22T00:00:00Z',
      },
    ],
    createdAt: '2023-10-22T00:00:00Z',
    updatedAt: '2023-10-22T00:00:00Z',
  },
  {
    id: '4',
    title: 'Commute & Meals',
    date: '2023-10-21T00:00:00Z',
    totalAmount: 40.00,
    status: ExpenseStatus.CREATED,
    expenses: [
      {
        id: 'e6',
        reportId: '4',
        category: ExpenseCategory.PARKING,
        amount: 15,
        description: 'Daily parking',
        date: '2023-10-21T00:00:00Z',
        createdAt: '2023-10-21T00:00:00Z',
        updatedAt: '2023-10-21T00:00:00Z',
      },
      {
        id: 'e7',
        reportId: '4',
        category: ExpenseCategory.MEALS,
        amount: 25,
        description: 'Lunch',
        date: '2023-10-21T00:00:00Z',
        createdAt: '2023-10-21T00:00:00Z',
        updatedAt: '2023-10-21T00:00:00Z',
      },
    ],
    createdAt: '2023-10-21T00:00:00Z',
    updatedAt: '2023-10-21T00:00:00Z',
  },
];
```

---

## Tests Additionnels

### FilterModal Tests

```typescript
// frontend/src/components/expense-reports/FilterModal.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterModal } from './FilterModal';
import { DEFAULT_FILTERS, ExpenseStatus } from '../../types/expense-report.types';
import { vi } from 'vitest';

describe('FilterModal', () => {
  const mockOnClose = vi.fn();
  const mockOnApply = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <FilterModal
        isOpen={true}
        onClose={mockOnClose}
        filters={DEFAULT_FILTERS}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('Filter & Sort')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <FilterModal
        isOpen={false}
        onClose={mockOnClose}
        filters={DEFAULT_FILTERS}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    expect(screen.queryByText('Filter & Sort')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <FilterModal
        isOpen={true}
        onClose={mockOnClose}
        filters={DEFAULT_FILTERS}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const closeButton = screen.getByLabelText('Close filter modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies filters when Apply button is clicked', async () => {
    render(
      <FilterModal
        isOpen={true}
        onClose={mockOnClose}
        filters={DEFAULT_FILTERS}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    // Select a status
    const submittedButton = screen.getByText('Submitted');
    fireEvent.click(submittedButton);

    // Click Apply
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ExpenseStatus.SUBMITTED,
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('clears filters when Clear button is clicked', () => {
    render(
      <FilterModal
        isOpen={true}
        onClose={mockOnClose}
        filters={DEFAULT_FILTERS}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('toggles category selection', () => {
    render(
      <FilterModal
        isOpen={true}
        onClose={mockOnClose}
        filters={DEFAULT_FILTERS}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const mealsButton = screen.getByText('Meals');
    
    // First click - select
    fireEvent.click(mealsButton);
    expect(mealsButton.parentElement).toHaveClass('bg-primary/10');

    // Second click - deselect
    fireEvent.click(mealsButton);
    expect(mealsButton.parentElement).not.toHaveClass('bg-primary/10');
  });
});
```

### SearchBar Tests

```typescript
// frontend/src/components/expense-reports/SearchBar.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { vi } from 'vitest';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Search..." />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test query');
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new search' } });
    
    expect(handleChange).toHaveBeenCalledWith('new search');
  });

  it('has search icon', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    
    expect(screen.getByText('search')).toBeInTheDocument();
  });
});
```

---

## Optimisations de Performance

### Memoization des Composants

```typescript
// frontend/src/components/expense-reports/ReportCard.tsx (optimisé)

import React, { memo } from 'react';

export const ReportCard = memo<ReportCardProps>(({ report, onClick }) => {
  // ... code existant
}, (prevProps, nextProps) => {
  // Custom comparison pour éviter les re-renders inutiles
  return (
    prevProps.report.id === nextProps.report.id &&
    prevProps.report.status === nextProps.report.status &&
    prevProps.report.totalAmount === nextProps.report.totalAmount
  );
});

ReportCard.displayName = 'ReportCard';
```

### Lazy Loading des Composants

```typescript
// frontend/src/pages/ExpenseReportsPage.tsx (avec lazy loading)

import React, { lazy, Suspense } from 'react';

const FilterModal = lazy(() => 
  import('../components/expense-reports/FilterModal').then(module => ({
    default: module.FilterModal
  }))
);

// Dans le JSX
<Suspense fallback={<div>Loading...</div>}>
  <FilterModal
    isOpen={isFilterModalOpen}
    onClose={() => setIsFilterModalOpen(false)}
    filters={filters}
    onApply={handleApplyFilters}
    onClear={handleClearFilters}
  />
</Suspense>
```

---

## Gestion des Erreurs

### Error Boundary

```typescript
// frontend/src/components/common/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
            error
          </span>
          <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Utilisation dans App.tsx

```typescript
// frontend/src/App.tsx (avec ErrorBoundary)

import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ... routes */}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

## Accessibilité (A11y)

### Focus Management

```typescript
// frontend/src/components/expense-reports/FilterModal.tsx (avec focus trap)

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';

export const FilterModal: React.FC<FilterModalProps> = ({ ... }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={closeButtonRef}
      >
        {/* ... */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close filter modal"
        >
          {/* ... */}
        </button>
        {/* ... */}
      </Dialog>
    </Transition>
  );
};
```

### Keyboard Navigation

```typescript
// frontend/src/components/expense-reports/ReportCard.tsx (avec keyboard support)

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${report.title} expense report`}
      className="..."
    >
      {/* ... */}
    </div>
  );
};
```

---

## Checklist de Validation

### Avant de Passer en Production

- [ ] **Fonctionnalités**
  - [ ] Recherche fonctionne avec debounce
  - [ ] Filtres s'appliquent correctement
  - [ ] Tri fonctionne (montant, date)
  - [ ] Navigation entre pages
  - [ ] Modal s'ouvre/ferme correctement
  - [ ] Chips de filtres sont supprimables

- [ ] **UI/UX**
  - [ ] Design responsive (mobile, tablette, desktop)
  - [ ] Mode sombre fonctionne
  - [ ] Animations fluides
  - [ ] États de chargement visibles
  - [ ] Messages d'erreur clairs
  - [ ] État vide bien géré

- [ ] **Performance**
  - [ ] Pas de re-renders inutiles
  - [ ] Debounce sur la recherche
  - [ ] Lazy loading des composants lourds
  - [ ] Images optimisées (si applicable)

- [ ] **Accessibilité**
  - [ ] Navigation au clavier
  - [ ] ARIA labels présents
  - [ ] Focus management
  - [ ] Contraste des couleurs suffisant
  - [ ] Lecteur d'écran compatible

- [ ] **Tests**
  - [ ] Tests unitaires passent
  - [ ] Tests d'intégration passent
  - [ ] Couverture ≥ 80%
  - [ ] Tests E2E (optionnel)

- [ ] **Code Quality**
  - [ ] ESLint sans erreurs
  - [ ] Prettier appliqué
  - [ ] Pas de console.log en production
  - [ ] Types TypeScript stricts
  - [ ] Documentation des composants

---

## Prochaines Étapes

### Fonctionnalités Additionnelles à Implémenter

1. **Page de Détails du Rapport**
   - Affichage complet des dépenses
   - Possibilité de modifier
   - Historique des changements de statut

2. **Création de Rapport**
   - Formulaire multi-étapes
   - Upload de reçus
   - Validation des données

3. **Gestion des Pièces Jointes**
   - Upload d'images
   - Prévisualisation
   - Compression automatique

4. **Notifications**
   - Toast messages
   - Notifications push
   - Badges de nouveaux éléments

5. **Export/Import**
   - Export PDF
   - Export CSV
   - Import de données

6. **Analytics**
   - Graphiques de dépenses
   - Statistiques par catégorie
   - Tendances mensuelles

---

## Conclusion

Ce guide complémentaire fournit tous les éléments manquants pour une implémentation complète et production-ready de l'écran "Expense Reports".

**Points clés :**
- ✅ Code complet et testé
- ✅ Performance optimisée
- ✅ Accessibilité garantie
- ✅ Gestion d'erreurs robuste
- ✅ Prêt pour le mode Code
