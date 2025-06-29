import { useEffect } from "react";
import { useAtom } from "jotai";
import { createClient } from "@/shared/lib/supabase/client";
import { userAtom, isLoadingAuthAtom } from "../atoms/authAtom";
import { Subscription } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAuthAtom);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Supabaseが設定されていない場合はスキップ
        const config = await import("@/shared/lib/supabase/config").then((m) =>
          m.getSupabaseConfig()
        );
        if (!config.isConfigured) {
          setIsLoading(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Supabaseが設定されている場合のみ認証状態の監視を設定
    let subscription: Subscription;
    const setupAuthListener = async () => {
      const config = await import("@/shared/lib/supabase/config").then((m) =>
        m.getSupabaseConfig()
      );
      if (config.isConfigured) {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });
        subscription = data.subscription;
      }
    };

    setupAuthListener();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase, setUser, setIsLoading]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
};
