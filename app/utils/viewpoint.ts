export const getViewpoint = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const localISOTime = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, -1);

  const now = new Date().toString();
  const indexOfGMT = now.indexOf("GMT");
  const tzDeltaWithGMT = now.slice(indexOfGMT + 3, indexOfGMT + 3 + 5);
  const formattedTzDelta = `${tzDeltaWithGMT.substring(
    0,
    3,
  )}:${tzDeltaWithGMT.substring(3)}`;

  return `${localISOTime}${formattedTzDelta}`;
};
