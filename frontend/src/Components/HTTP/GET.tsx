import axios, { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";

interface ParamsType {
  queryKey?: string | string[];
  headers?: Record<string, string>;
  queryKeyId?: number | string | undefined;
  retry?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: Response) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
}

const fetchData = async ({
  endpoint,
  headers,
}: {
  endpoint: string;
  headers?: Record<string, string>;
}): Promise<Response> => {
  const config = headers ? { headers } : {};
  const response = await axios.get<Response>(endpoint, config);
  return response.data;
};

// Custom hook to fetch data
const useGetData = ({
  endpoint,
  params,
}: {
  endpoint: string;
  params: ParamsType;
}): UseQueryResult<Response, AxiosError> => {
  const [customParams, setCustomParams] = useState<ParamsType>({});

  useEffect(() => {
    const newCustomParams: ParamsType = {
      queryKey: params.queryKey,
      retry: params.retry ?? 1,
      refetchOnWindowFocus: params.refetchOnWindowFocus ?? true,
      enabled: params.enabled ?? true,
    };

    setCustomParams(newCustomParams);
  }, [endpoint, JSON.stringify(params)]);

  const queryResult = useQuery<Response, AxiosError>({
    queryKey: Array.isArray(customParams.queryKey)
      ? customParams.queryKey
      : [customParams.queryKey],
    queryFn: () =>
      fetchData({
        endpoint,
        headers: params.headers ?? {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    retry: customParams.retry,
    refetchOnWindowFocus: customParams.refetchOnWindowFocus,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: customParams.enabled,
  });

  useEffect(() => {
    if (queryResult.isSuccess && params.onSuccess) {
      params.onSuccess(queryResult.data);
    }
    if (queryResult.isError && params.onError) {
      params.onError(queryResult.error);
    }
  }, [queryResult, params]);

  return queryResult;
};

export { useGetData };
