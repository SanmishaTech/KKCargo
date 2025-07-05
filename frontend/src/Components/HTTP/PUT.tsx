import axios, { AxiosError, AxiosResponse } from "axios";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Define types for request and response data
interface RequestData {
  [key: string]: any;
}

interface ParamsType {
  headers?: Record<string, string>;
  queryKey?: string | string[];
  onSuccess?: (data: AxiosResponse<Response>) => void;
  onError?: (error: AxiosError) => void;
  retry?: number;
}

// Define the POST function
const postData = async ({
  endpoint,
  data,
  headers,
}: {
  endpoint: string;
  data: RequestData;
  headers?: Record<string, string>;
}): Promise<AxiosResponse<Response>> => {
  const config = headers ? { headers } : {};
  const response = await axios.put<Response>(endpoint, data, config);
  return response;
};

// Custom hook to handle POST requests
const usePutData = ({
  endpoint,
  params,
}: {
  endpoint: string;
  params: ParamsType;
}): UseMutationResult<AxiosResponse<Response>, AxiosError, RequestData> => {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<Response>, AxiosError, RequestData>({
    mutationFn: (data) =>
      postData({
        endpoint,
        data,
        headers: params.headers ?? {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    onSuccess: (data) => {
      if (params.onSuccess) {
        params.onSuccess(data);
      } else {
        toast.success("Data updated successfully");
      }
      if (params.queryKey) {
        const key = Array.isArray(params.queryKey)
          ? params.queryKey
          : [params.queryKey];
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
    onError: params.onError ?? ((error: AxiosError) => toast.error(error.message)),
    retry: params.retry ?? 0,
    onSettled: () => {
      /* noop */
    },
  });
};

export { usePutData };
