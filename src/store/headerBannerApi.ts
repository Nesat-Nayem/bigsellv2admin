import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IHeaderBanner {
  _id: string
  title: string
  image: string
  isActive: boolean
  order: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface HeaderBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: IHeaderBanner[]
}

export const headerBannerApi = createApi({
  reducerPath: 'headerBannerApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['headerBanner'],
  endpoints: (builder) => ({
    //   GET all banners
    getHeaderBanner: builder.query<IHeaderBanner[], void>({
      query: () => '/header-banners',
      transformResponse: (response: HeaderBannerResponse) => response.data,
      providesTags: ['headerBanner'],
    }),

    //   UPDATE banner (requires id)
    updateHeaderBanner: builder.mutation<IHeaderBanner, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/header-banners/${id}`,
        method: 'PUT',
        body: formData, // send FormData directly
      }),
      transformResponse: (response: { data: IHeaderBanner }) => response.data,
      invalidatesTags: ['headerBanner'],
    }),
  }),
})

export const { useGetHeaderBannerQuery, useUpdateHeaderBannerMutation } = headerBannerApi
