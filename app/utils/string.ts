export const getUntilFirstSpace = (input: string): string => {
  const indexOfSpace = input.indexOf(" ");

  if (indexOfSpace !== -1) {
    return input.slice(0, indexOfSpace);
  }

  return input;
};
