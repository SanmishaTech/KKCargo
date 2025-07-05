import axios, { AxiosError, AxiosResponse } from "axios";
import {
  useMutation,
  UseMutationResult,
  MutationFunction,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Define types for request and response data
interface RequestData {
  [key: string]: any;
}

interface ParamsType {
  headers?: Record<string, string>;
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
  const response = await axios.delete<Response>(endpoint, config);
  return response;
};

// Custom hook to handle POST requests
const useDeleteData = ({
  endpoint,
  params,
}: {
  endpoint: string;
  params: ParamsType;
}): UseMutationResult<AxiosResponse<Response>, AxiosError, RequestData> => {
  // return useMutation<AxiosResponse<Response>, AxiosError, RequestData>(
  //   (data) => postData({ endpoint, data, headers: params.headers }),
  //   {
  //     onSuccess:
  //       params.onSuccess ?? (() => toast.success("Data posted successfully")),
  //     onError:
  //       params.onError ?? ((error: AxiosError) => toast.error(error.message)),
  //     retry: params.retry ?? 3,
  //   }
  // );
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
    onSuccess:
      params.onSuccess ?? (() => toast.success("Data Deleted successfully")),
    onError:
      params.onError ?? ((error: AxiosError) => toast.error(error.message)),
    retry: params.retry ?? 1,
    onSettled: (data) => {
      console.log(data);
    },
  });
};

export { useDeleteData };
