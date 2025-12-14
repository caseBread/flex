import { api } from "@/modules/api";
import { useQuery } from "@tanstack/react-query";

const ROLE_ENDPOINT = "/api/auth/role";

const fetchData = async () => {
  const res = await api.get<{ role: string | null }>({
    path: ROLE_ENDPOINT,
  });

  return res;
};

export const useRoleQuery = () => {
  return useQuery({
    queryKey: [ROLE_ENDPOINT],
    queryFn: fetchData,
  });
};
