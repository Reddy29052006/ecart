'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import type { CategoryEntity } from '@/modules/catalog/category.types';
import type { ProductSortOption } from '@/modules/catalog/catalog.dto';

export interface FilterState {
  search: string;
  categorySlug: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sortBy: ProductSortOption;
}

interface ProductFiltersProps {
  filters: FilterState;
  categories: CategoryEntity[];
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
}

export function ProductFilters({ filters, categories, onChange, onReset }: ProductFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.categorySlug) ||
    Boolean(filters.brand) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.inStock ||
    filters.sortBy !== 'newest';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          Filters & Search
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-terracotta-500)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Reset All
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Search Products
        </label>
        <Input
          type="text"
          placeholder="Search by name, description..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {/* Sort Selector */}
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as ProductSortOption })}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-main)',
            color: 'var(--color-text-primary)',
            fontSize: '14px',
          }}
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Category Dropdown */}
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Category
        </label>
        <select
          value={filters.categorySlug}
          onChange={(e) => onChange({ categorySlug: e.target.value })}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-main)',
            color: 'var(--color-text-primary)',
            fontSize: '14px',
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Input */}
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Brand / Maker
        </label>
        <Input
          type="text"
          placeholder="Filter by brand..."
          value={filters.brand}
          onChange={(e) => onChange({ brand: e.target.value })}
        />
      </div>

      {/* Price Range */}
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Price Range ($)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      {/* In Stock Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="inStockCheck"
          checked={filters.inStock}
          onChange={(e) => onChange({ inStock: e.target.checked })}
          style={{ width: '16px', height: '16px', accentColor: 'var(--color-pistachio-dark)' }}
        />
        <label htmlFor="inStockCheck" style={{ fontSize: '14px', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
          In stock items only
        </label>
      </div>
    </div>
  );
}
