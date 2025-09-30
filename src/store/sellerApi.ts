import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IVendorApp {
  _id: string
  vendorName: string
  email: string
  phone: string
  address: string
  gstNo?: string
  subscriptionId?: string
  planName?: string
  planPrice?: number
  planBillingCycle?: 'monthly' | 'yearly'
  planColor?: string
  aadharUrl: string
  panUrl: string
  paymentStatus?: 'pending' | 'done' | 'failed'
  paymentAmount?: number
  kycStatus: 'pending' | 'approved' | 'rejected'
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message?: string
  data: T
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number }
}

export const sellerApi = createApi({
  reducerPath: 'sellerApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      if (!headers.has('Content-Type')) headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Seller'],
  endpoints: (builder) => ({
    getSellers: builder.query<{ items: IVendorApp[]; total: number; page: number; limit: number; totalPages: number }, { search?: string; page?: number; limit?: number; kycStatus?: 'pending' | 'approved' | 'rejected' } | void>({
      query: (params) => {
        const qp = new URLSearchParams()
        if (params?.search) qp.set('search', params.search)
        if (params?.page != null) qp.set('page', String(params.page))
        if (params?.limit != null) qp.set('limit', String(params.limit))
        if (params?.kycStatus) qp.set('kycStatus', params.kycStatus)
        const qs = qp.toString()
        return `vendors${qs ? `?${qs}` : ''}`
      },
      transformResponse: (res: ApiResponse<IVendorApp[]>): { items: IVendorApp[]; total: number; page: number; limit: number; totalPages: number } => {
        const items = Array.isArray(res.data) ? res.data : []
        const meta = res.meta || {}
        return {
          items,
          total: meta.total ?? items.length,
          page: meta.page ?? 1,
          limit: meta.limit ?? items.length,
          totalPages: meta.totalPages ?? 1,
        }
      },
      providesTags: (result) =>
        result
          ? [...result.items.map((i) => ({ type: 'Seller' as const, id: i._id })), { type: 'Seller', id: 'LIST' }]
          : [{ type: 'Seller', id: 'LIST' }],
    }),

    getSellerById: builder.query<IVendorApp, string>({
      query: (id) => `vendors/${id}`,
      transformResponse: (res: ApiResponse<IVendorApp>) => res.data,
      providesTags: (result, error, id) => [{ type: 'Seller', id }],
    }),

    updateSeller: builder.mutation<IVendorApp, { id: string; data: Partial<IVendorApp> }>({
      query: ({ id, data }) => ({ url: `vendors/${id}`, method: 'PUT', body: data, headers: { 'Content-Type': 'application/json' } }),
      transformResponse: (res: ApiResponse<IVendorApp>) => res.data,
      invalidatesTags: (r, e, { id }) => [{ type: 'Seller', id }, { type: 'Seller', id: 'LIST' }],
    }),

    updateSellerStatus: builder.mutation<IVendorApp, { id: string; kycStatus: 'pending' | 'approved' | 'rejected' }>({
      query: ({ id, kycStatus }) => ({ url: `vendors/${id}/status`, method: 'PATCH', body: { kycStatus }, headers: { 'Content-Type': 'application/json' } }),
      transformResponse: (res: ApiResponse<IVendorApp>) => res.data,
      invalidatesTags: (r, e, { id }) => [{ type: 'Seller', id }, { type: 'Seller', id: 'LIST' }],
    }),

    deleteSeller: builder.mutation<IVendorApp, string>({
      query: (id) => ({ url: `vendors/${id}`, method: 'DELETE' }),
      transformResponse: (res: ApiResponse<IVendorApp>) => res.data,
      invalidatesTags: [{ type: 'Seller', id: 'LIST' }],
    }),
  }),
})

export const { useGetSellersQuery, useGetSellerByIdQuery, useUpdateSellerMutation, useUpdateSellerStatusMutation, useDeleteSellerMutation } = sellerApi
