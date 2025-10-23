import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IDiscountBanner {
  title: string
  offer: string
  image: string
  url: string
}

interface DiscountBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: IDiscountBanner | IDiscountBanner[] // allow single or multiple
}

export const discountBannerApi = createApi({
  reducerPath: 'discountBannerApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://api.atpuae.com/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['discountBanner'],
  endpoints: (builder) => ({
    // GET
    getDiscountBanner: builder.query<IDiscountBanner[], void>({
      query: () => '/discount-offers',
      transformResponse: (response: DiscountBannerResponse) => {
        return Array.isArray(response.data) ? response.data : [response.data]
      },
      providesTags: ['discountBanner'],
    }),

    // UPDATE
    updateDiscountBanner: builder.mutation<IDiscountBanner[], FormData>({
      query: (data) => ({
        url: '/discount-offers',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: DiscountBannerResponse) => {
        return Array.isArray(response.data) ? response.data : [response.data]
      },
      invalidatesTags: ['discountBanner'],
    }),
  }),
})

export const { useGetDiscountBannerQuery, useUpdateDiscountBannerMutation } = discountBannerApi
