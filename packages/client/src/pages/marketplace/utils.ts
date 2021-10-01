function fallbackCopyTextToClipboard(text) {
  
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
const 
clipboardCopy = (text) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
},
isHex = (h) => {
  var regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(h);
},
compressAddress = (a) => {
  if (!a) return "";
  if (a.length === 64 && isHex(a)) return a.substr(0, 16) + "...";
  else {
    var pp = a.split("-");
    if (pp.length <= 4) return a;
    else {
      return pp[0] + "-" + pp[1].substr(0, 3) + "..." + pp[pp.length-3].substr(2) + "-" + pp[pp.length-2] + "-" + pp[pp.length-1];
    }
  }
},
displayDate = (d) => {
  return new Date(d).toString();
},
numf = (n, d) => {
  if (n === "N/A") return n;
  d = (d ?? 2);
  return n.toFixed(d).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};
export {
  clipboardCopy, compressAddress, displayDate, numf
};