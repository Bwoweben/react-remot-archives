export const login = (email: string, password: string): Promise<boolean> => {
    console.log('Authenticating user:', email);
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        // Mock credentials
        if (email === 'admin@example.com' && password === 'password123') {
          console.log('Authentication successful.');
          resolve(true);
        } else {
          console.log('Authentication failed.');
          resolve(false);
        }
      }, 1000); // Simulate 1-second network delay
    });
  };