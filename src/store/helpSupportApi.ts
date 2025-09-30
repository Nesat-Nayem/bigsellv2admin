import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IHelpCenter {
  _id: string
  content: string
  updatedAt: string
}

interface HelpSupportResponse {
  success: boolean
  statusCode: number
  message: string
  data: IHelpCenter
}

export const helpSupportApi = createApi({
  reducerPath: 'helpSupportApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.bigsell.org/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['HelpSupport'],
  endpoints: (builder) => ({
    getHelpSupport: builder.query<IHelpCenter, void>({
      query: () => ({
        url: 'help-support',
      }),
      transformResponse: (response: HelpSupportResponse) => response.data,
      providesTags: ['HelpSupport'],
    }),

    // update
    updateHelpSupport: builder.mutation<IHelpCenter, { content: string }>({
      query: (data) => ({
        url: 'help-support',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: HelpSupportResponse) => response.data,
      invalidatesTags: ['HelpSupport'],
    }),
  }),
})

export const { useGetHelpSupportQuery, useUpdateHelpSupportMutation } = helpSupportApi
