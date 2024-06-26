import { useContext, useState } from "react";
import { NoteContext } from "../context/NoteProvider";

interface ApiResult<T> {
  action: (body?: T) => Promise<any>;
  isLoading: boolean;
  loadingError: string | null;
}

const useApiTemplate = <T>(endpoint: string, method: string): ApiResult<T> => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { setUser } = useContext(NoteContext);

  const action = async (body?: T): Promise<any> => {
    setIsLoading(true);
    setLoadingError(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
        }
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message || `${method} ${endpoint} failed.`);
      }

      setLoadingError(null);

      if (response.status === 204) {
        return;
      }

      return await response.json();
    } catch (err: any) {
      setLoadingError(err.message || `${method} ${endpoint} failed.`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { action, isLoading, loadingError };
};

export default useApiTemplate;
