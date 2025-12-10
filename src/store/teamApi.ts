import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ITeam {
  _id: string
  name: string
  designation: string
  image: File | string
  createdAt: string
  updatedAt: string
  status?: 'Active' | 'Inactive'
}

interface TeamResponse {
  success: boolean
  statusCode: number
  message: string
  data: ITeam | ITeam[]
}

export const teamApi = createApi({
  reducerPath: 'teamApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['team'],
  endpoints: (builder) => ({
    getTeams: builder.query<ITeam[], void>({
      query: () => 'teams',
      transformResponse: (response: TeamResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['team'],
    }),
    getTeamById: builder.query<ITeam, string>({
      query: (id) => `teams/${id}`,
      transformResponse: (response: TeamResponse) => response.data as ITeam,
      providesTags: (result, error, id) => [{ type: 'team', id }],
    }),
    createTeam: builder.mutation<ITeam, FormData>({
      query: (formData) => ({ url: 'teams', method: 'POST', body: formData }),
      transformResponse: (response: TeamResponse) => response.data as ITeam,
      invalidatesTags: ['team'],
    }),
    updateTeam: builder.mutation<ITeam, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `teams/${id}`, method: 'PUT', body: data }),
      transformResponse: (response: TeamResponse) => response.data as ITeam,
      invalidatesTags: (result, error, { id }) => [{ type: 'team', id }, 'team'],
    }),
    deleteTeam: builder.mutation<ITeam, string>({
      query: (id) => ({ url: `teams/${id}`, method: 'DELETE' }),
      transformResponse: (response: TeamResponse) => response.data as ITeam,
      invalidatesTags: ['team'],
    }),
  }),
})

export const { useGetTeamsQuery, useGetTeamByIdQuery, useCreateTeamMutation, useUpdateTeamMutation, useDeleteTeamMutation } = teamApi
