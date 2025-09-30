import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IOfferBanner {
  title: string
  subtitle: string
  offer: string
  url: string
  image: string
}

interface OfferBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: IOfferBanner | IOfferBanner[]
}

export const offerBannerApi = createApi({
  reducerPath: 'offerBannerApi',
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
  tagTypes: ['offerBanner'],
  endpoints: (builder) => ({
    // GET
    getOfferBanner: builder.query<IOfferBanner[], void>({
      query: () => '/offer-banners',
      transformResponse: (response: OfferBannerResponse) => {
        return Array.isArray(response.data) ? response.data : [response.data]
      },
      providesTags: ['offerBanner'],
    }),

    // UPDATE
    updateOfferBanner: builder.mutation<IOfferBanner[], FormData>({
      query: (data) => ({
        url: '/offer-banners',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: OfferBannerResponse) => {
        return Array.isArray(response.data) ? response.data : [response.data]
      },
      invalidatesTags: ['offerBanner'],
    }),
  }),
})

export const { useGetOfferBannerQuery, useUpdateOfferBannerMutation } = offerBannerApi
