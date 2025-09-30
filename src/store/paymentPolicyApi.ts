import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' //   use /react for hooks
import { RootState as IRootState } from '@/store'

export interface IPaymentPolicy {
  _id: string
  content: string
  updatedAt: string
}

interface PaymentPolicyResponse {
  success: boolean
  statusCode: number
  message: string
  data: IPaymentPolicy
}

export const paymentPolicyApi = createApi({
  reducerPath: 'paymentPolicy',
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
  tagTypes: ['paymentPolicy'],
  endpoints: (builder) => ({
    // get
    getPaymentPolicy: builder.query<IPaymentPolicy, void>({
      query: () => '/payment-policy',
      transformResponse: (response: PaymentPolicyResponse) => response.data,
      providesTags: ['paymentPolicy'],
    }),

    // update
    updatePaymentPolicy: builder.mutation<IPaymentPolicy, { content: string }>({
      query: (data) => ({
        url: '/payment-policy',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: PaymentPolicyResponse) => response.data,
      invalidatesTags: ['paymentPolicy'],
    }),
  }),
})

export const { useGetPaymentPolicyQuery, useUpdatePaymentPolicyMutation } = paymentPolicyApi
