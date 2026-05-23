# CRM Patterns — crm_client

---

## Role-Based UI (Admin Only)

All CRM pages must be behind the Next.js middleware guard (see `auth-flow.md`).
At the component level, verify role from Redux before rendering sensitive actions:

```tsx
// crm_client/components/AdminGuard.tsx
'use client';
import { useAppSelector } from '@/store';
import { selectIsAdmin } from '@/store/slices/authSlice';
import { redirect } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = useAppSelector(selectIsAdmin);
  if (!isAdmin) redirect('/login');
  return <>{children}</>;
}
```

---

## Recharts — Mapping API Data

The API returns raw data arrays. Always map them to Recharts-compatible shapes before passing to chart components.

### Revenue Line Chart
```tsx
// crm_client/components/charts/RevenueChart.tsx
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '@/store';
import { selectRevenueData } from '@/store/slices/dashboardSlice';

// API shape: { date: '2024-01-15', revenue: 1500, orders: 12 }[]
// Recharts wants: { name: string, value: number }[] per axis

export default function RevenueChart() {
  const rawData = useAppSelector(selectRevenueData);

  // Map once; never transform inside JSX render
  const chartData = rawData.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: point.revenue,
    orders: point.orders,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="revenue" orientation="left" tickFormatter={(v) => `$${v.toLocaleString()}`} />
        <YAxis yAxisId="orders" orientation="right" />
        <Tooltip
          formatter={(value, name) =>
            name === 'revenue' ? [`$${Number(value).toLocaleString()}`, 'Revenue'] : [value, 'Orders']
          }
        />
        <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Stats Cards Pattern
```tsx
// crm_client/components/dashboard/StatsGrid.tsx
import { DashboardStats } from '@/types';

interface StatCardProps {
  label: string;
  value: string | number;
  growth?: number;
  icon?: React.ReactNode;
}

function StatCard({ label, value, growth, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {growth !== undefined && (
        <p className={`mt-1 text-sm ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs last period
        </p>
      )}
    </div>
  );
}

export default function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} growth={stats.revenueGrowth} />
      <StatCard label="Total Orders" value={stats.totalOrders} growth={stats.ordersGrowth} />
      <StatCard label="Total Users" value={stats.totalUsers} />
      <StatCard label="Total Products" value={stats.totalProducts} />
    </div>
  );
}
```

---

## Data Table Pattern (shadcn/ui Table + Pagination)

```tsx
// crm_client/components/DataTable.tsx — reusable for Products, Orders, Users
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PaginationMeta } from '@/types';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export default function DataTable<T extends { _id: string }>({
  data, columns, pagination, onPageChange, isLoading
}: DataTableProps<T>) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={String(col.key)}>{col.label}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={columns.length} className="text-center">Loading...</TableCell></TableRow>
          ) : data.map(row => (
            <TableRow key={row._id}>
              {columns.map(col => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {data.length} of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >Previous</Button>
            <span className="flex items-center px-3 text-sm">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="outline" size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Dashboard RTK Slice

```ts
// crm_client/store/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { DashboardStats, RevenueDataPoint } from '@/types';
import { RootState } from '@/store';

interface DashboardState {
  stats: DashboardStats | null;
  revenueData: RevenueDataPoint[];
  period: '7d' | '30d' | '90d' | '1y';
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  revenueData: [],
  period: '30d',
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardStats, void, { rejectValue: string }>(
  'dashboard/stats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/dashboard/stats');
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchRevenueData = createAsyncThunk<
  RevenueDataPoint[],
  '7d' | '30d' | '90d' | '1y',
  { rejectValue: string }
>('dashboard/revenue', async (period, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/dashboard/revenue?period=${period}`);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch revenue data');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setPeriod: (state, action) => { state.period = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.revenueData = action.payload;
      });
  },
});

export const { setPeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;

export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectRevenueData = (state: RootState) => state.dashboard.revenueData;
export const selectDashboardPeriod = (state: RootState) => state.dashboard.period;
```