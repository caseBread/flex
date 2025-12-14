import { api } from "@/modules/api";
import { useQuery } from "@tanstack/react-query";

const IS_LOGINED_ENDPOINT = "/api/auth/is-logined";

const fetchData = async () => {
  const res = await api.get<{ isLogined: boolean }>({
    path: IS_LOGINED_ENDPOINT,
  });

  return res;
};

export const useIsLoginedQuery = () => {
  return useQuery({
    queryKey: [IS_LOGINED_ENDPOINT],
    queryFn: fetchData,
  });
};
