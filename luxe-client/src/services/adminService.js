import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL;

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
  }),
  tagTypes: ['AdminStats', 'RecentOrders'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/orders/stats',
      providesTags: ['AdminStats'],
    }),

    getRecentOrders: builder.query({
      query: () => '/orders?limit=5&sort=-createdAt',
      providesTags: ['RecentOrders'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRecentOrdersQuery,
} = adminApi;