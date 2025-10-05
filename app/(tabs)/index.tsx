import { useNavigationContainerRef, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function IndexRedirect() {
  const router = useRouter();
  const navReady = useNavigationContainerRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace({ pathname: '/login' } as any);
    }, 0); // aguarda 1 tick para garantir montagem

    return () => clearTimeout(timeout);
  }, [router]);

  return null;
}
