
export function capitalize(words) {
  const wordArray = words.split(" ");

  for (let i = 0; i < wordArray.length; i++) {
    wordArray[i] = wordArray[i][0].toUpperCase() + wordArray[i].substr(1);
  }
  return wordArray.join(" ");
}
