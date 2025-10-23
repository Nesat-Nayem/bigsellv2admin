import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' //   use /react for hooks
import { RootState as IRootState } from '@/store'

export interface ISiteSecurity {
  _id: string
  content: string
  updatedAt: string
}

interface SiteSecurityResponse {
  success: boolean
  statusCode: number
  message: string
  data: ISiteSecurity
}

export const siteSecurityApi = createApi({
  reducerPath: 'siteSecurity',
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
  tagTypes: ['siteSecurity'],
  endpoints: (builder) => ({
    // get
    getSiteSecurity: builder.query<ISiteSecurity, void>({
      query: () => '/site-security',
      transformResponse: (response: SiteSecurityResponse) => response.data,
      providesTags: ['siteSecurity'],
    }),

    // update
    updateSiteSecurity: builder.mutation<ISiteSecurity, { content: string }>({
      query: (data) => ({
        url: '/site-security',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SiteSecurityResponse) => response.data,
      invalidatesTags: ['siteSecurity'],
    }),
  }),
})

export const { useGetSiteSecurityQuery, useUpdateSiteSecurityMutation } = siteSecurityApi
