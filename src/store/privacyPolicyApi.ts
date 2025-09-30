import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' //   use /react for hooks
import { RootState as IRootState } from '@/store'

export interface IPrivacyPolicy {
  _id: string
  content: string
  updatedAt: string
}

interface PrivacyPolicyResponse {
  success: boolean
  statusCode: number
  message: string
  data: IPrivacyPolicy
}

export const privacyPolicyApi = createApi({
  reducerPath: 'privacyPolicyApi',
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
  tagTypes: ['privacyPolicy'],
  endpoints: (builder) => ({
    // get privacy policy
    getPrivacyPolicy: builder.query<IPrivacyPolicy, void>({
      query: () => '/privacy-policy',
      transformResponse: (response: PrivacyPolicyResponse) => response.data,
      providesTags: ['privacyPolicy'],
    }),

    // update privacy policy
    updatePrivacyPolicy: builder.mutation<IPrivacyPolicy, { content: string }>({
      query: (data) => ({
        url: '/privacy-policy',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: PrivacyPolicyResponse) => response.data,
      invalidatesTags: ['privacyPolicy'],
    }),
  }),
})

export const { useGetPrivacyPolicyQuery, useUpdatePrivacyPolicyMutation } = privacyPolicyApi
