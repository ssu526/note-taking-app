import useApiTemplate from "./useApiTemplate";

interface LoginParams {
  email: string;
  password: string;
}

interface SignupParams {
  username: string;
  email: string;
  password: string;
}

// Auth APIs
export const useLogin = () => useApiTemplate<LoginParams>("/login", "POST");

export const useSignup = () => useApiTemplate<SignupParams>("/signup", "POST");

export const useGetUser = () => useApiTemplate<undefined>("/user", "GET");

export const useLogout = () => useApiTemplate<undefined>("/logout", "POST");

// Flow APIs
export const useGetFlows = () => useApiTemplate<undefined>("/flows", "GET");

export const useGetFlow = (flowId: string) =>
  useApiTemplate<undefined>(`/flows/${flowId}`, "GET");

export const useUpdateFlow = (flowId: string) =>
  useApiTemplate<any>(`/flows/${flowId}`, "PUT");

export const useUpdateTopic = () =>
  useApiTemplate<any>("/flows/update_name", "PUT");

export const useAddFlow = () => useApiTemplate<undefined>("/flows", "POST");

export const useDeleteFlow = () => useApiTemplate<any>(`/flows`, "DELETE");

// Note APIs
export const useAddNote = () => useApiTemplate<any>("/notes", "POST");

export const useGetNote = (noteId: string) =>
  useApiTemplate<undefined>(`/notes/${noteId}`, "GET");

export const useUpdateNote = (noteId: string) =>
  useApiTemplate<any>(`/notes/${noteId}`, "PUT");

export const useDeleteNote = () => useApiTemplate<any>("/notes", "DELETE");
