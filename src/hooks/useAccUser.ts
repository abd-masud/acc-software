"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAccUserRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        const accUser = localStorage.getItem("acc_user");
        if (!accUser) {
            router.push("/auth/login");
        }
    }, [router]);
};
