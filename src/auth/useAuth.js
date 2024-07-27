// import { useEffect, useState } from 'react';
// import { auth } from '../firebase'; // Ensure this path is correct

// export const useAuth = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(user => {
//       setIsAuthenticated(!!user);
//       setLoading(false);
//       console.log('Auth state changed:', !!user); // Debug log
//     });

//     return () => unsubscribe();
//   }, []);

//   return { isAuthenticated, loading };
// };
// src/hooks/useAuth.js
// src/auth/useAuth.js
import { useEffect, useState } from 'react';
import { auth } from '../firebase';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

export default useAuth;

