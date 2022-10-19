export const isAuthenticated = async (session) => {
  if (
    !session ||
    Math.floor(Date.now()) >= session.user.expires_at * 1000
  ) {
    return false;
  }
  return true;
}