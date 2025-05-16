export const validateEmail = (email) => {
  const regrex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regrex.test(email);
};
