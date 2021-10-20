const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw message || 'Assertion failed';
  }
};

export default assert;
