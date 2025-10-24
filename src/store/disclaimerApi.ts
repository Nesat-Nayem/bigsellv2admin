import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' //   use /react for hooks
import { RootState as IRootState } from '@/store'

export interface IDisclaimer {
  _id: string
  content: string
  updatedAt: string
}

interface disclaimerResponse {
  success: boolean
  statusCode: number
  message: string
  data: IDisclaimer
}

export const disclaimerApi = createApi({
  reducerPath: 'disclaimer',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.atpuae.com/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['disclaimer'],
  endpoints: (builder) => ({
    // get
    getDisclaimer: builder.query<IDisclaimer, void>({
      query: () => '/disclaimer',
      transformResponse: (response: disclaimerResponse) => response.data,
      providesTags: ['disclaimer'],
    }),

    // update
    updateDisclaimer: builder.mutation<IDisclaimer, { content: string }>({
      query: (data) => ({
        url: '/disclaimer',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: disclaimerResponse) => response.data,
      invalidatesTags: ['disclaimer'],
    }),
  }),
})

export const { useGetDisclaimerQuery, useUpdateDisclaimerMutation } = disclaimerApi
