# Architecture de l'Écran Expense Reports

## Vue d'ensemble

Ce document décrit l'architecture complète pour implémenter l'écran "Expense Reports" en React avec TypeScript et TailwindCSS, basé sur le design fourni.

---

## 1. Analyse de l'Écran

### 1.1 Structure Visuelle

L'écran se compose de 5 sections principales :

1. **Header** (sticky)
   - Titre centré : "Expense Reports"
   - Bouton "+" pour créer un nouveau rapport

2. **Barre de recherche**
   - Input avec icône de recherche
   - Placeholder : "Search reports..."

3. **Filtres et tri**
   - Bouton "Filter & Sort" avec icône tune
   - Chips de filtres actifs (removable)
   - Modal de filtrage (bottom sheet)

4. **Liste des rapports**
   - Cards avec informations du rapport
   - Icônes de catégories
   - Statut coloré

5. **Footer de navigation** (fixed)
   - 3 onglets : Reports, Submit, Profile
   - Indicateur d'onglet actif

### 1.2 Fonctionnalités Identifiées

- ✅ Recherche de rapports
- ✅ Filtrage par statut, date, montant, catégories
- ✅ Tri (ex: montant décroissant)
- ✅ Affichage de chips de filtres actifs
- ✅ Suppression individuelle de filtres
- ✅ Modal de filtrage avec options multiples
- ✅ Navigation entre sections
- ✅ Support du mode sombre
- ✅ Design responsive mobile-first

---

## 2. Architecture des Composants React

### 2.1 Hiérarchie des Composants

```
ExpenseReportsPage/
├── Header
│   ├── PageTitle
│   └── AddButton
├── SearchBar
├── FilterSection
│   ├── FilterButton
│   └── ActiveFiltersChips
│       └── FilterChip (multiple)
├── ReportsList
│   └── ReportCard (multiple)
│       ├── ReportHeader
│       ├── CategoryIcons
│       └── StatusBadge
├── BottomNavigation
│   └── NavItem (multiple)
└── FilterModal
    ├── ModalHeader
    ├── StatusFilter
    ├── DateRangeFilter
    ├── AmountRangeFilter
    ├── CategoriesFilter
    └── ModalActions
```

### 2.2 Composants Détaillés

#### **ExpenseReportsPage** (Page principale)
```typescript
// frontend/src/pages/ExpenseReportsPage.tsx
- État : filtres actifs, modal ouvert/fermé, recherche
- Gestion des filtres et du tri
- Fetch des données depuis l'API
- Coordination des composants enfants
```

#### **Header** (Composant réutilisable)
```typescript
// frontend/src/components/expense-reports/Header.tsx
- Props: title, onAddClick
- Sticky positioning
- Bouton d'ajout avec icône +
```

#### **SearchBar** (Composant réutilisable)
```typescript
// frontend/src/components/expense-reports/SearchBar.tsx
- Props: value, onChange, placeholder
- Icône de recherche Material Symbols
- Debounce pour optimiser les recherches
```

#### **FilterButton** (Composant simple)
```typescript
// frontend/src/components/expense-reports/FilterButton.tsx
- Props: onClick, activeFiltersCount
- Badge optionnel pour nombre de filtres actifs
```

#### **FilterChip** (Composant réutilisable)
```typescript
// frontend/src/components/expense-reports/FilterChip.tsx
- Props: label, onRemove
- Bouton de suppression avec icône close
- Style : bg-primary avec texte blanc
```

#### **ReportCard** (Composant principal)
```typescript
// frontend/src/components/expense-reports/ReportCard.tsx
- Props: report (ExpenseReport)
- Affichage : titre, date, montant, catégories, statut
- Click handler pour navigation vers détails
- Shadow et rounded corners
```

#### **CategoryIcon** (Composant atomique)
```typescript
// frontend/src/components/expense-reports/CategoryIcon.tsx
- Props: category (ExpenseCategory)
- Mapping catégorie → icône Material Symbols
- Style : cercle bg-primary/10 avec icône primary
```

#### **StatusBadge** (Composant atomique)
```typescript
// frontend/src/components/expense-reports/StatusBadge.tsx
- Props: status (ExpenseStatus)
- Classes CSS dynamiques selon le statut
- Couleurs : Created (orange), Submitted (blue), Validated (lime), Paid (green), Denied (red)
```

#### **FilterModal** (Composant complexe)
```typescript
// frontend/src/components/expense-reports/FilterModal.tsx
- Props: isOpen, onClose, filters, onApply, onClear
- Bottom sheet avec animation slide-up
- Overlay avec backdrop blur
- Sections : Status, Date Range, Amount, Categories
- Boutons : Clear et Apply Filters
```

#### **BottomNavigation** (Layout component)
```typescript
// frontend/src/components/layout/BottomNavigation.tsx
- Props: activeTab
- Fixed positioning
- 3 onglets avec icônes et labels
- Indicateur visuel de l'onglet actif
```

---

## 3. Types TypeScript

### 3.1 Interfaces Principales

```typescript
// frontend/src/types/expense-report.types.ts

export enum ExpenseStatus {
  CREATED = 'Created',
  SUBMITTED = 'Submitted',
  VALIDATED = 'Validated',
  PAID = 'Paid',
  DENIED = 'Denied'
}

export enum ExpenseCategory {
  MEALS = 'restaurant',
  TRAVEL = 'flight',
  SUPPLIES = 'shopping_cart',
  TEAM_EVENT = 'groups',
  PARKING = 'local_parking',
  ACCOMMODATION = 'hotel',
  TRANSPORT = 'directions_car'
}

export interface ExpenseReport {
  id: string;
  title: string;
  date: string; // ISO date
  totalAmount: number;
  status: ExpenseStatus;
  categories: ExpenseCategory[]; // Catégories des dépenses incluses
  expenses: Expense[]; // Liste des dépenses
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  reportId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
}

export interface FilterState {
  search: string;
  status: ExpenseStatus | null;
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number;
  amountMax: number;
  categories: ExpenseCategory[];
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}
```

---

## 4. Configuration TailwindCSS

### 4.1 Thème Personnalisé

```javascript
// tailwind.config.js (extension)
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#40B59D',
        'background-light': '#f6f8f7',
        'background-dark': '#12201d',
        'foreground-light': '#1f2937',
        'foreground-dark': '#f9fafb',
        'muted-light': '#6b7280',
        'muted-dark': '#9ca3af',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
    },
  },
}
```

### 4.2 Classes CSS Personnalisées

```css
/* frontend/src/styles/expense-reports.css */

.status-created {
  color: #f59e0b; /* amber-500 */
}

.status-submitted {
  color: #3b82f6; /* blue-500 */
}

.status-validated {
  color: #84cc16; /* lime-500 */
}

.status-paid {
  color: #10b981; /* emerald-500 */
}

.status-denied {
  color: #ef4444; /* red-500 */
}
```

---

## 5. Intégration Backend

### 5.1 API Endpoints Nécessaires

```typescript
// frontend/src/api/expense-reports.api.ts

// GET /api/expense-reports
// Query params: search, status, dateFrom, dateTo, amountMin, amountMax, categories[], sortBy, sortOrder
export const getExpenseReports = async (filters: FilterState): Promise<ExpenseReport[]>

// POST /api/expense-reports
export const createExpenseReport = async (data: CreateExpenseReportDto): Promise<ExpenseReport>

// GET /api/expense-reports/:id
export const getExpenseReportById = async (id: string): Promise<ExpenseReport>

// PATCH /api/expense-reports/:id
export const updateExpenseReport = async (id: string, data: UpdateExpenseReportDto): Promise<ExpenseReport>

// DELETE /api/expense-reports/:id
export const deleteExpenseReport = async (id: string): Promise<void>
```

### 5.2 Custom Hook pour la Gestion des Données

```typescript
// frontend/src/hooks/useExpenseReports.ts

export const useExpenseReports = (filters: FilterState) => {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch avec debounce pour la recherche
  // Gestion du cache
  // Optimistic updates
  
  return { reports, loading, error, refetch };
}
```

---

## 6. Gestion de l'État

### 6.1 État Local (useState)

```typescript
// Dans ExpenseReportsPage.tsx
const [filters, setFilters] = useState<FilterState>(defaultFilters);
const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

### 6.2 État Dérivé

```typescript
// Filtres actifs pour affichage des chips
const activeFilters = useMemo(() => {
  const active: Array<{ key: string; label: string }> = [];
  
  if (filters.status) {
    active.push({ key: 'status', label: `Status: ${filters.status}` });
  }
  
  if (filters.sortBy) {
    const order = filters.sortOrder === 'desc' ? 'High to Low' : 'Low to High';
    active.push({ key: 'sort', label: `Amount: ${order}` });
  }
  
  // ... autres filtres
  
  return active;
}, [filters]);
```

---

## 7. Patterns UI et Interactions

### 7.1 Animations

```typescript
// Utilisation de Framer Motion ou CSS transitions

// Modal slide-up
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 25 }}
>
  {/* FilterModal content */}
</motion.div>

// Fade overlay
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {/* Backdrop */}
</motion.div>
```

### 7.2 Interactions Utilisateur

1. **Recherche avec debounce** (500ms)
2. **Click sur carte** → Navigation vers détails
3. **Click sur "+"** → Modal de création
4. **Click sur chip de filtre** → Suppression du filtre
5. **Click sur "Filter & Sort"** → Ouverture modal
6. **Swipe down sur modal** → Fermeture (optionnel)

### 7.3 États de Chargement

```typescript
// Skeleton loading pour les cartes
{loading ? (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white dark:bg-background-dark/50 p-4 rounded-xl animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    ))}
  </div>
) : (
  <ReportsList reports={reports} />
)}
```

### 7.4 États Vides

```typescript
// Aucun rapport trouvé
{reports.length === 0 && !loading && (
  <div className="text-center py-12">
    <span className="material-symbols-outlined text-6xl text-muted-light dark:text-muted-dark mb-4">
      receipt_long
    </span>
    <p className="text-foreground-light dark:text-foreground-dark font-semibold">
      No reports found
    </p>
    <p className="text-sm text-muted-light dark:text-muted-dark mt-2">
      Try adjusting your filters or create a new report
    </p>
  </div>
)}
```

---

## 8. Accessibilité

### 8.1 ARIA Labels

```typescript
<button
  aria-label="Add new expense report"
  onClick={handleAddClick}
>
  <svg aria-hidden="true">...</svg>
</button>

<input
  type="text"
  aria-label="Search expense reports"
  placeholder="Search reports..."
/>
```

### 8.2 Navigation au Clavier

- Tab navigation pour tous les éléments interactifs
- Escape pour fermer la modal
- Enter pour soumettre la recherche

### 8.3 Focus Management

```typescript
// Focus trap dans la modal
import { FocusTrap } from '@headlessui/react';

<FocusTrap active={isFilterModalOpen}>
  <FilterModal ... />
</FocusTrap>
```

---

## 9. Performance

### 9.1 Optimisations

1. **Lazy loading** des composants lourds
```typescript
const FilterModal = lazy(() => import('./components/FilterModal'));
```

2. **Memoization** des composants
```typescript
export const ReportCard = memo(({ report }: ReportCardProps) => {
  // ...
});
```

3. **Virtualization** pour longues listes
```typescript
import { FixedSizeList } from 'react-window';
```

4. **Debounce** pour la recherche
```typescript
const debouncedSearch = useDebouncedValue(searchQuery, 500);
```

### 9.2 Code Splitting

```typescript
// Route-based splitting
const ExpenseReportsPage = lazy(() => import('./pages/ExpenseReportsPage'));
```

---

## 10. Tests

### 10.1 Tests Unitaires

```typescript
// ReportCard.test.tsx
describe('ReportCard', () => {
  it('should render report information correctly', () => {
    const report = mockExpenseReport();
    render(<ReportCard report={report} />);
    
    expect(screen.getByText(report.title)).toBeInTheDocument();
    expect(screen.getByText(`$${report.totalAmount.toFixed(2)}`)).toBeInTheDocument();
  });
  
  it('should display correct status badge color', () => {
    const report = { ...mockExpenseReport(), status: ExpenseStatus.SUBMITTED };
    render(<ReportCard report={report} />);
    
    const badge = screen.getByText('Submitted');
    expect(badge).toHaveClass('status-submitted');
  });
});
```

### 10.2 Tests d'Intégration

```typescript
// ExpenseReportsPage.test.tsx
describe('ExpenseReportsPage', () => {
  it('should filter reports by status', async () => {
    render(<ExpenseReportsPage />);
    
    // Ouvrir modal de filtrage
    fireEvent.click(screen.getByText('Filter & Sort'));
    
    // Sélectionner statut
    fireEvent.click(screen.getByText('Submitted'));
    
    // Appliquer filtres
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Vérifier que seuls les rapports "Submitted" sont affichés
    await waitFor(() => {
      const badges = screen.getAllByText('Submitted');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
```

---

## 11. Structure des Fichiers

```
frontend/src/
├── pages/
│   └── ExpenseReportsPage.tsx          # Page principale
├── components/
│   ├── layout/
│   │   └── BottomNavigation.tsx        # Navigation footer
│   └── expense-reports/
│       ├── Header.tsx                  # Header avec titre et bouton +
│       ├── SearchBar.tsx               # Barre de recherche
│       ├── FilterButton.tsx            # Bouton "Filter & Sort"
│       ├── FilterChip.tsx              # Chip de filtre actif
│       ├── ReportCard.tsx              # Carte de rapport
│       ├── CategoryIcon.tsx            # Icône de catégorie
│       ├── StatusBadge.tsx             # Badge de statut
│       └── FilterModal.tsx             # Modal de filtrage
├── hooks/
│   ├── useExpenseReports.ts            # Hook pour fetch des rapports
│   └── useDebouncedValue.ts            # Hook pour debounce
├── api/
│   └── expense-reports.api.ts          # Appels API
├── types/
│   └── expense-report.types.ts         # Types TypeScript
├── styles/
│   └── expense-reports.css             # Styles personnalisés
└── utils/
    ├── formatters.ts                   # Formatage dates, montants
    └── category-icons.ts               # Mapping catégories → icônes
```

---

## 12. Dépendances Nécessaires

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "@headlessui/react": "^1.7.17",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 13. Roadmap d'Implémentation

### Phase 1 : Structure de Base (2-3h)
- [x] Créer les types TypeScript
- [ ] Implémenter ExpenseReportsPage (structure)
- [ ] Créer Header component
- [ ] Créer BottomNavigation component
- [ ] Configurer TailwindCSS avec thème personnalisé

### Phase 2 : Liste et Cartes (3-4h)
- [ ] Implémenter ReportCard component
- [ ] Créer CategoryIcon component
- [ ] Créer StatusBadge component
- [ ] Implémenter la liste avec données mockées
- [ ] Ajouter les styles et animations

### Phase 3 : Recherche et Filtres (4-5h)
- [ ] Implémenter SearchBar avec debounce
- [ ] Créer FilterButton component
- [ ] Créer FilterChip component
- [ ] Implémenter FilterModal (UI)
- [ ] Connecter la logique de filtrage

### Phase 4 : Intégration Backend (2-3h)
- [ ] Créer les fonctions API
- [ ] Implémenter useExpenseReports hook
- [ ] Connecter les composants à l'API
- [ ] Gérer les états de chargement et erreurs

### Phase 5 : Polish et Tests (3-4h)
- [ ] Ajouter les animations
- [ ] Implémenter le mode sombre
- [ ] Écrire les tests unitaires
- [ ] Écrire les tests d'intégration
- [ ] Optimiser les performances
- [ ] Vérifier l'accessibilité

**Temps total estimé : 14-19 heures**

---

## 14. Considérations Techniques

### 14.1 Mode Sombre

Utiliser la classe `dark:` de TailwindCSS avec un provider de thème :

```typescript
// ThemeProvider.tsx
const [theme, setTheme] = useState<'light' | 'dark'>('light');

useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);
```

### 14.2 Responsive Design

L'écran est mobile-first, mais prévoir des breakpoints pour tablette/desktop :

```typescript
// Exemple de layout responsive
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  {reports.map(report => <ReportCard key={report.id} report={report} />)}
</div>
```

### 14.3 Gestion des Icônes

Utiliser Material Symbols Outlined (comme dans le HTML fourni) :

```html
<!-- Dans index.html -->
<link 
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" 
  rel="stylesheet"
/>
```

```typescript
// Dans les composants
<span className="material-symbols-outlined">restaurant</span>
```

---

## 15. Points d'Attention

### ⚠️ Critiques

1. **Performance** : Virtualiser la liste si > 100 rapports
2. **Sécurité** : Valider et sanitizer les inputs de recherche
3. **UX** : Feedback visuel immédiat lors des actions
4. **Accessibilité** : Tester avec lecteur d'écran

### 💡 Améliorations Futures

1. **Offline support** avec Service Workers
2. **Pull-to-refresh** pour actualiser les données
3. **Infinite scroll** au lieu de pagination
4. **Export PDF** des rapports
5. **Notifications push** pour changements de statut
6. **Graphiques** de dépenses par catégorie

---

## Conclusion

Cette architecture fournit une base solide pour implémenter l'écran "Expense Reports" en React. Elle privilégie :

- ✅ **Modularité** : Composants réutilisables et testables
- ✅ **Performance** : Optimisations et lazy loading
- ✅ **Maintenabilité** : Types stricts et structure claire
- ✅ **UX** : Animations fluides et feedback utilisateur
- ✅ **Accessibilité** : ARIA labels et navigation clavier

Le plan est prêt pour être implémenté par le mode Code.
