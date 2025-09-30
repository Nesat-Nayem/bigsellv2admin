import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IMainBanner {
  _id: string
  image: File | string
  createdAt: string
  updatedAt: string
}

interface IMainBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: IMainBanner | IMainBanner[]
}

export const mainBannerApi = createApi({
  reducerPath: 'mainBannerApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.bigsell.org/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),

  tagTypes: ['mainBanner'],
  endpoints: (builder) => ({
    getmainBanners: builder.query<IMainBanner[], void>({
      query: () => 'banners',
      transformResponse: (response: IMainBannerResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['mainBanner'],
    }),

    getmainBannerById: builder.query<IMainBanner, string>({
      query: (id) => `banners/${id}`,
      transformResponse: (response: IMainBannerResponse) => response.data as IMainBanner,
      providesTags: (result, error, id) => [{ type: 'mainBanner', id }],
    }),

    createmainBanner: builder.mutation<IMainBanner, FormData>({
      query: (formData) => ({
        url: 'banners',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: IMainBannerResponse) => response.data as IMainBanner,
      invalidatesTags: ['mainBanner'],
    }),

    updatemainBanner: builder.mutation<IMainBanner, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `banners/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: IMainBannerResponse) => response.data as IMainBanner,
      invalidatesTags: (result, error, { id }) => [{ type: 'mainBanner', id }, 'mainBanner'],
    }),

    deletemainBanner: builder.mutation<IMainBanner, string>({
      query: (id) => ({
        url: `banners/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: IMainBannerResponse) => response.data as IMainBanner,
      invalidatesTags: ['mainBanner'],
    }),
  }),
})

export const {
  useGetmainBannersQuery,
  useGetmainBannerByIdQuery,
  useCreatemainBannerMutation,
  useUpdatemainBannerMutation,
  useDeletemainBannerMutation,
} = mainBannerApi
