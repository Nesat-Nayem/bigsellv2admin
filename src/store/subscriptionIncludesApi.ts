import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IInclude {
  _id: string
  title: string
  order?: number
  isActive?: boolean
  isDeleted?: boolean
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

export const subscriptionIncludesApi = createApi({
  reducerPath: 'subscriptionIncludesApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.atpuae.com/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      if (!headers.has('Content-Type')) headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Include'],
  endpoints: (builder) => ({
    getIncludes: builder.query<{ items: IInclude[]; total: number; page: number; limit: number; totalPages: number }, { search?: string; page?: number; limit?: number; active?: boolean } | void>({
      query: (params) => {
        const qp = new URLSearchParams()
        if (params?.search) qp.set('search', params.search)
        if (params?.page != null) qp.set('page', String(params.page))
        if (params?.limit != null) qp.set('limit', String(params.limit))
        if (params?.active != null) qp.set('active', String(params.active))
        const qs = qp.toString()
        return `subscription-includes${qs ? `?${qs}` : ''}`
      },
      transformResponse: (res: ApiResponse<IInclude[]>): { items: IInclude[]; total: number; page: number; limit: number; totalPages: number } => {
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
          ? [...result.items.map((i) => ({ type: 'Include' as const, id: i._id })), { type: 'Include', id: 'LIST' }]
          : [{ type: 'Include', id: 'LIST' }],
    }),

    getIncludeById: builder.query<IInclude, string>({
      query: (id) => `subscription-includes/${id}`,
      transformResponse: (res: ApiResponse<IInclude>) => res.data,
      providesTags: (result, error, id) => [{ type: 'Include', id }],
    }),

    createInclude: builder.mutation<IInclude, Partial<IInclude>>({
      query: (data) => ({ url: 'subscription-includes', method: 'POST', body: data, headers: { 'Content-Type': 'application/json' } }),
      transformResponse: (res: ApiResponse<IInclude>) => res.data,
      invalidatesTags: [{ type: 'Include', id: 'LIST' }],
    }),

    updateInclude: builder.mutation<IInclude, { id: string; data: Partial<IInclude> }>({
      query: ({ id, data }) => ({ url: `subscription-includes/${id}`, method: 'PUT', body: data, headers: { 'Content-Type': 'application/json' } }),
      transformResponse: (res: ApiResponse<IInclude>) => res.data,
      invalidatesTags: (r, e, { id }) => [{ type: 'Include', id }, { type: 'Include', id: 'LIST' }],
    }),

    deleteInclude: builder.mutation<IInclude, string>({
      query: (id) => ({ url: `subscription-includes/${id}`, method: 'DELETE' }),
      transformResponse: (res: ApiResponse<IInclude>) => res.data,
      invalidatesTags: [{ type: 'Include', id: 'LIST' }],
    }),

    toggleInclude: builder.mutation<IInclude, { id: string; isActive?: boolean }>({
      query: ({ id, isActive }) => ({
        url: `subscription-includes/${id}/toggle`,
        method: 'PATCH',
        body: isActive === undefined ? undefined : { isActive },
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (res: ApiResponse<IInclude>) => res.data,
      invalidatesTags: (r, e, { id }) => [{ type: 'Include', id }, { type: 'Include', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetIncludesQuery,
  useGetIncludeByIdQuery,
  useCreateIncludeMutation,
  useUpdateIncludeMutation,
  useDeleteIncludeMutation,
  useToggleIncludeMutation,
} = subscriptionIncludesApi
