import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState as IRootState } from '@/store'

export interface ICoupon {
  _id?: string
  code: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderAmount?: number | null
  startDate: string | Date
  endDate: string | Date
  status: 'active' | 'inactive'
  vendor?: string | null
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T = any> {
  success: boolean
  statusCode: number
  message?: string
  data?: T
}

export const couponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://api.atpuae.com/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Coupons'],
  endpoints: (builder) => ({
    getCoupons: builder.query<ICoupon[], void>({
      query: () => '/coupons',
      transformResponse: (res: ApiResponse<ICoupon[]>) => (Array.isArray(res?.data) ? res.data : []),
      providesTags: (result) =>
        result && result.length
          ? [{ type: 'Coupons' as const, id: 'LIST' }, ...result.map((c) => ({ type: 'Coupons' as const, id: c._id || 'UNKNOWN' }))]
          : [{ type: 'Coupons' as const, id: 'LIST' }],
    }),
    getCouponById: builder.query<ICoupon | undefined, string>({
      query: (id) => `/coupons/${encodeURIComponent(id)}`,
      transformResponse: (res: ApiResponse<ICoupon>) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'Coupons', id }],
    }),
    createCoupon: builder.mutation<ICoupon, Partial<ICoupon>>({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      transformResponse: (res: ApiResponse<ICoupon>) => res?.data as ICoupon,
      invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
    }),
    updateCoupon: builder.mutation<ICoupon, { id: string; data: Partial<ICoupon> }>({
      query: ({ id, data }) => ({ url: `/coupons/${encodeURIComponent(id)}`, method: 'PUT', body: data }),
      transformResponse: (res: ApiResponse<ICoupon>) => res?.data as ICoupon,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Coupons', id }, { type: 'Coupons', id: 'LIST' }],
    }),
    deleteCoupon: builder.mutation<ICoupon, string>({
      query: (id) => ({ url: `/coupons/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: (res: ApiResponse<ICoupon>) => res?.data as ICoupon,
      invalidatesTags: (_r, _e, id) => [{ type: 'Coupons', id }, { type: 'Coupons', id: 'LIST' }],
    }),
  }),
})

export const { useGetCouponsQuery, useGetCouponByIdQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } = couponApi
export default couponApi
