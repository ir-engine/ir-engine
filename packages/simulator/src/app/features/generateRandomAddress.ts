const generateRandomAddress = (): string => {
  return (
    '0x' +
    [
      Math.floor(Math.random() * 1000000000).toString(16),
      Math.floor(Math.random() * 1000000000).toString(16),
      Math.floor(Math.random() * 1000000000).toString(16),
      Math.floor(Math.random() * 1000000000).toString(16),
      Math.floor(Math.random() * 1000000000).toString(16),
      Math.floor(Math.random() * 1000000000).toString(16)
    ]
      .join('')
      .slice(0, 40)
  );
};

export default generateRandomAddress;
