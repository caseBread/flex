import { api } from "@/modules/api";
import { useQuery } from "@tanstack/react-query";

const USER_ID_ENDPOINT = "/api/auth/user-id";

const fetchData = async () => {
  const res = await api.get<{ userId: string | null }>({
    path: USER_ID_ENDPOINT,
  });

  return res;
};

export const useUserIdQuery = () => {
  return useQuery({
    queryKey: [USER_ID_ENDPOINT],
    queryFn: fetchData,
  });
};
