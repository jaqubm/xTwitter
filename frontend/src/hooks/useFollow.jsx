import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`http://localhost:8000/api/users/follow/${userId}`, {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong!");

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        toast.success("User followed succesfully"),
      ])
    },
    onError: () => {
      toast.error(error.message)
    }
  });

  return { follow, isPending };
}

export default useFollow;