export const PROVIDERS = ['zoom', 'mrw', 'tealca'];
export const isValidCommand = (command: string): boolean => {
  const regex = /^\d+@.+/;
  return regex.test(command);
};
