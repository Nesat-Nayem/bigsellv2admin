import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ISubscription {
  _id: string
  name: string
  slug?: string
  price: number
  currency?: string
  billingCycle?: 'monthly' | 'yearly'
  color?: string
  features: string[]
  includeIds?: string[]
  order?: number
  isActive: boolean
  isDeleted: boolean
  metaTitle?: string
  metaTags?: string[]
  metaDescription?: string
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number }
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.atpuae.com/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Subscription'],
  endpoints: (builder) => ({
    // Paged search for admin list
    searchSubscriptions: builder.query<
      { items: ISubscription[]; total: number; page: number; limit: number; totalPages: number },
      { search?: string; page?: number; limit?: number; active?: boolean }
    >({
      query: (params) => {
        const qp = new URLSearchParams()
        if (params?.search) qp.set('search', params.search)
        if (params?.page != null) qp.set('page', String(params.page))
        if (params?.limit != null) qp.set('limit', String(params.limit))
        if (params?.active != null) qp.set('active', String(params.active))
        const qs = qp.toString()
        return `subscriptions${qs ? `?${qs}` : ''}`
      },
      transformResponse: (res: ApiResponse<ISubscription[]>): { items: ISubscription[]; total: number; page: number; limit: number; totalPages: number } => {
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
      providesTags: (result) => (result ? [...result.items.map((p) => ({ type: 'Subscription' as const, id: p._id })), 'Subscription'] : ['Subscription']),
    }),

    getSubscriptions: builder.query<ISubscription[], { active?: boolean; limit?: number } | void>({
      query: (params) => {
        const qs: string[] = []
        if (params?.active !== undefined) qs.push(`active=${params.active}`)
        if (params?.limit !== undefined) qs.push(`limit=${params.limit}`)
        const q = qs.length ? `?${qs.join('&')}` : ''
        return `subscriptions${q}`
      },
      transformResponse: (response: ApiResponse<ISubscription[]>) => response.data,
      providesTags: ['Subscription'],
    }),

    getSubscriptionById: builder.query<ISubscription, string>({
      query: (id) => `subscriptions/${id}`,
      transformResponse: (response: ApiResponse<ISubscription>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Subscription', id }],
    }),

    createSubscription: builder.mutation<ISubscription, Partial<ISubscription>>({
      query: (data) => ({
        url: 'subscriptions',
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (response: ApiResponse<ISubscription>) => response.data,
      invalidatesTags: ['Subscription'],
    }),

    updateSubscription: builder.mutation<ISubscription, { id: string; data: Partial<ISubscription> }>({
      query: ({ id, data }) => ({
        url: `subscriptions/${id}`,
        method: 'PUT',
        body: data,
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (response: ApiResponse<ISubscription>) => response.data,
      invalidatesTags: (r, e, { id }) => [{ type: 'Subscription', id }, 'Subscription'],
    }),

    deleteSubscription: builder.mutation<ISubscription, string>({
      query: (id) => ({ url: `subscriptions/${id}`, method: 'DELETE' }),
      transformResponse: (response: ApiResponse<ISubscription>) => response.data,
      invalidatesTags: ['Subscription'],
    }),

    toggleSubscription: builder.mutation<ISubscription, { id: string; isActive?: boolean }>({
      query: ({ id, isActive }) => ({
        url: `subscriptions/${id}/toggle`,
        method: 'PATCH',
        body: isActive === undefined ? undefined : { isActive },
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (response: ApiResponse<ISubscription>) => response.data,
      invalidatesTags: (r, e, { id }) => [{ type: 'Subscription', id }, 'Subscription'],
    }),
  }),
})

export const {
  useSearchSubscriptionsQuery,
  useGetSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useToggleSubscriptionMutation,
} = subscriptionApi
